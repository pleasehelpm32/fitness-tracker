import React, { useState, useEffect } from "react";

const activities = [
  { name: "Stretch", icon: "🧘" },
  { name: "Cycle", icon: "🚴" },
  { name: "Swim", icon: "🏊" },
  { name: "Lift", icon: "🏋️" },
  { name: "Walk", icon: "🚶" },
  { name: "Ball", icon: "🏀" },
];

const liftTypes = [
  { name: "Push", icon: "💪" },
  { name: "Pull", icon: "🎒" },
  { name: "Legs", icon: "🦵" },
  { name: "Full body", icon: "🏋️" },
];

const DailyFitnessTracker = () => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedLiftType, setSelectedLiftType] = useState("");
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [editingDate, setEditingDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayStartDate, setDisplayStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    return date;
  });
  const [expandedWorkouts, setExpandedWorkouts] = useState({});

  useEffect(() => {
    updateSelectedActivities();
  }, [editingDate, workouts]);

  const updateSelectedActivities = () => {
    let relevantDate = editingDate ? new Date(editingDate) : new Date();
    const relevantWorkouts = workouts.filter(
      (w) => new Date(w.date).toDateString() === relevantDate.toDateString()
    );
    setSelectedActivities(relevantWorkouts.map((w) => w.activity));
    const relevantLift = relevantWorkouts.find((w) => w.activity === "Lift");
    setSelectedLiftType(relevantLift ? relevantLift.liftType : "");
  };

  const handleActivityToggle = (activity) => {
    const targetDate = editingDate || new Date().toISOString();

    setSelectedActivities((prev) => {
      if (prev.includes(activity)) {
        const newActivities = prev.filter((a) => a !== activity);
        if (activity === "Lift") {
          setSelectedLiftType("");
        }
        handleRemoveWorkout(activity, targetDate);
        return newActivities;
      } else {
        handleAddWorkout(activity, targetDate);
        return activity === "Lift"
          ? [...prev, activity]
          : [...prev.filter((a) => a !== "Lift"), activity];
      }
    });
  };

  const handleAddWorkout = (activity, date) => {
    setWorkouts((prev) => [
      ...prev.filter(
        (w) =>
          !(
            w.activity === activity &&
            new Date(w.date).toDateString() === new Date(date).toDateString()
          )
      ),
      {
        id: Date.now() + Math.random(),
        activity,
        date,
        liftType: activity === "Lift" ? selectedLiftType : null,
        duration: "",
        notes: "",
      },
    ]);
  };

  const handleRemoveWorkout = (activity, date) => {
    setWorkouts((prev) =>
      prev.filter(
        (w) =>
          !(
            w.activity === activity &&
            new Date(w.date).toDateString() === new Date(date).toDateString()
          )
      )
    );
  };

  const handleEditWorkouts = (date) => {
    setEditingDate(date);
  };

  const handleUpdateWorkouts = () => {
    if (editingDate) {
      setWorkouts((prev) => {
        const updatedWorkouts = prev.filter(
          (w) =>
            new Date(w.date).toDateString() !==
            new Date(editingDate).toDateString()
        );
        const newWorkouts = selectedActivities.map((activity) => ({
          id: Date.now() + Math.random(),
          activity,
          date: editingDate,
          liftType: activity === "Lift" ? selectedLiftType : null,
          duration: "",
          notes: "",
        }));
        return [...updatedWorkouts, ...newWorkouts];
      });
      setEditingDate(null);
    }
  };

  const handleLiftTypeChange = (e) => {
    const newLiftType = e.target.value;
    setSelectedLiftType(newLiftType);
    const targetDate = editingDate || new Date().toISOString();
    setWorkouts((prev) =>
      prev.map((w) =>
        w.activity === "Lift" &&
        new Date(w.date).toDateString() === new Date(targetDate).toDateString()
          ? { ...w, liftType: newLiftType }
          : w
      )
    );
  };

  const getWeeklyProgress = () => {
    const today = new Date(currentDate);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const daysWorkedOut = new Set(
      workouts
        .filter((workout) => {
          const workoutDate = new Date(workout.date);
          return workoutDate >= startOfWeek && workoutDate < endOfWeek;
        })
        .map((workout) => new Date(workout.date).toLocaleDateString())
    ).size;
    return daysWorkedOut;
  };

  const formatDate = (date) => {
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  };

  const getWorkoutsForDay = (date) => {
    return workouts.filter(
      (w) => new Date(w.date).toDateString() === date.toDateString()
    );
  };

  const isActiveDay = (date) => {
    return editingDate
      ? new Date(editingDate).toDateString() === date.toDateString()
      : date.toDateString() === currentDate.toDateString();
  };

  const getWorkoutIcon = (workout) => {
    if (workout.activity === "Lift") {
      return liftTypes.find((t) => t.name === workout.liftType)?.icon || "🏋️";
    }
    return activities.find((a) => a.name === workout.activity)?.icon;
  };

  const handleScroll = (direction) => {
    const newDate = new Date(displayStartDate);
    newDate.setDate(
      displayStartDate.getDate() + (direction === "left" ? -1 : 1)
    );
    setDisplayStartDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setDisplayStartDate(new Date(new Date().setDate(new Date().getDate() - 2)));
    setEditingDate(null);
  };

  const renderDateView = () => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(displayStartDate);
      date.setDate(displayStartDate.getDate() + i);
      const dayWorkouts = getWorkoutsForDay(date);
      const formattedDate = formatDate(date);
      days.push(
        <div
          key={date.toISOString()}
          className="text-center w-1/5 flex-shrink-0"
        >
          <div className="text-sm font-bold">{formattedDate.day}</div>
          <div className="text-xs mb-1">{formattedDate.date}</div>
          <div
            className={`w-16 h-16 rounded-full flex flex-wrap items-center justify-center p-1 cursor-pointer mx-auto ${
              isActiveDay(date) ? "bg-blue-200" : "bg-gray-200"
            }`}
            onClick={() => handleEditWorkouts(date.toISOString())}
          >
            {dayWorkouts.length > 0 ? (
              dayWorkouts.slice(0, 4).map((workout) => (
                <span key={workout.id} className="text-lg m-0.5">
                  {getWorkoutIcon(workout)}
                </span>
              ))
            ) : (
              <span className="text-xl">❌</span>
            )}
            {dayWorkouts.length > 4 && (
              <span className="text-xs">+{dayWorkouts.length - 4}</span>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  const toggleWorkoutExpand = (workoutId) => {
    setExpandedWorkouts((prev) => ({
      ...prev,
      [workoutId]: !prev[workoutId],
    }));
  };

  const updateWorkoutDetails = (workoutId, field, value) => {
    setWorkouts((prev) =>
      prev.map((w) => (w.id === workoutId ? { ...w, [field]: value } : w))
    );
  };

  const renderRecentWorkouts = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of day

    const recentWorkouts = workouts
      .filter((w) => new Date(w.date) <= today)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const groupedWorkouts = recentWorkouts.reduce((acc, workout) => {
      const dateKey = new Date(workout.date).toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(workout);
      return acc;
    }, {});

    return Object.entries(groupedWorkouts).map(([date, workouts]) => (
      <div key={date} className="mb-4">
        <h3 className="text-xl font-bold mb-2">{date}</h3>
        {workouts.map((workout) => (
          <div key={workout.id} className="mb-2">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => toggleWorkoutExpand(workout.id)}
            >
              <span className="mr-2">
                {expandedWorkouts[workout.id] ? "▼" : "▶"}
              </span>
              <span className="text-2xl mr-2">{getWorkoutIcon(workout)}</span>
              <span>
                {workout.activity}{" "}
                {workout.liftType ? `(${workout.liftType})` : ""}
              </span>
            </div>
            {expandedWorkouts[workout.id] && (
              <div className="ml-8 mt-2">
                <input
                  type="text"
                  placeholder="Duration"
                  value={workout.duration}
                  onChange={(e) =>
                    updateWorkoutDetails(workout.id, "duration", e.target.value)
                  }
                  className="border p-2 rounded mb-2 w-full"
                />
                <textarea
                  placeholder="Notes"
                  value={workout.notes}
                  onChange={(e) =>
                    updateWorkoutDetails(workout.id, "notes", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Daily Fitness Tracker</h1>

      <div className="flex justify-between items-center mb-6">
        {activities.map((activity) => (
          <button
            key={activity.name}
            onClick={() => handleActivityToggle(activity.name)}
            className={`p-4 rounded-full text-3xl ${
              selectedActivities.includes(activity.name)
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {activity.icon}
          </button>
        ))}
      </div>

      <div className="mb-6">
        {selectedActivities.includes("Lift") && (
          <select
            value={selectedLiftType}
            onChange={handleLiftTypeChange}
            className="border p-2 rounded mb-4 w-full"
          >
            <option value="">Select lift type</option>
            {liftTypes.map((type) => (
              <option key={type.name} value={type.name}>
                {type.icon} {type.name}
              </option>
            ))}
          </select>
        )}
        {editingDate && (
          <button
            onClick={handleUpdateWorkouts}
            className="bg-green-500 text-white p-3 rounded-full text-xl w-full"
          >
            💾 Update Workouts
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <label className="font-semibold text-xl">Goal:</label>
          <input
            type="number"
            value={weeklyGoal}
            onChange={(e) =>
              setWeeklyGoal(
                Math.max(1, Math.min(7, parseInt(e.target.value) || 1))
              )
            }
            className="border p-2 rounded w-20 text-xl"
          />
          <span className="text-xl">days/week</span>
        </div>
        <p className="text-2xl mb-2">
          {getWeeklyProgress()} / {weeklyGoal} days worked out
        </p>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-blue-600 h-4 rounded-full"
            style={{
              width: `${Math.min(
                100,
                (getWeeklyProgress() / weeklyGoal) * 100
              )}%`,
            }}
          ></div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => handleScroll("left")}
            className="p-2 bg-gray-200 rounded-full"
          >
            ◀
          </button>
          <div className="flex justify-between w-full px-4">
            {renderDateView()}
          </div>
          <button
            onClick={() => handleScroll("right")}
            className="p-2 bg-gray-200 rounded-full"
          >
            ▶
          </button>
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleToday}
            className="bg-blue-500 text-white p-2 rounded-full px-4"
          >
            Today
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Workouts</h2>
        {renderRecentWorkouts()}
      </div>
    </div>
  );
};

export default DailyFitnessTracker;
