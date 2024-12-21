import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./App.css";

// Chart.js 구성 요소 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const colorMap = {
    1: "#FF0000", // 빨강
    2: "#FF7F00", // 주황
    3: "#FFFF00", // 노랑
    4: "#008000", // 초록
    5: "#0000FF", // 파랑
  };

  const [tasks, setTasks] = useState([]);
  const [algorithm, setAlgorithm] = useState("FCFS");
  const [ganttChart, setGanttChart] = useState([]);
  const [averageResponseTime, setAverageResponseTime] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [quantum, setQuantum] = useState(2);
  const [showGraph, setShowGraph] = useState(false);
  const [arrivalTime, setArrivalTime] = useState("");
  const [burstTime, setBurstTime] = useState("");

  useEffect(() => {
    if (tasks.length > 5) {
      alert("최대 5개의 작업만 추가 가능합니다.");
      setTasks(tasks.slice(0, 5));
    }
  }, [tasks]);

  const addTask = () => {
    if (arrivalTime === "" || burstTime === "") {
      alert("Input Arrival Time and Burst Time!");
      return;
    }
    const newTaskId =
      tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;

    const newTask = {
      id: newTaskId,
      arrivalTime: Number(arrivalTime),
      burstTime: Number(burstTime),
    };
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, newTask];
      simulate(updatedTasks);
      return updatedTasks;
    });

    setArrivalTime("");
    setBurstTime("");
  };

  const deleteTask = (taskId) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((task) => task.id !== taskId);
      simulate(updatedTasks);
      return updatedTasks;
    });
  };

  const getColorByTaskId = (taskId) => {
    return colorMap[taskId] || "#000000";
  };

  const simulate = (taskList = tasks) => {
    let currentTime = 0;
    let totalResponseTime = 0;
    const gantt = [];

    if (algorithm === "FCFS") {
      setExplanation("FCFS: First Come, First Served");
      taskList.sort((a, b) => a.arrivalTime - b.arrivalTime);
      taskList.forEach((task) => {
        if (currentTime < task.arrivalTime) {
          currentTime = task.arrivalTime;
        }
        const start = currentTime;
        const end = start + task.burstTime;
        gantt.push({
          task,
          start,
          end,
          color: getColorByTaskId(task.id),
          responseTime: start - task.arrivalTime,
        });
        totalResponseTime += start - task.arrivalTime;
        currentTime = end;
      });
    } else if (algorithm === "SJF") {
      setExplanation("SJF: Shortest Job First");
      const queue = [...taskList].sort(
        (a, b) => a.arrivalTime - b.arrivalTime || a.burstTime - b.burstTime
      );
      while (queue.length > 0) {
        const availableTasks = queue.filter(
          (t) => t.arrivalTime <= currentTime
        );
        const task =
          availableTasks.length > 0
            ? availableTasks.sort((a, b) => a.burstTime - b.burstTime)[0]
            : queue[0];

        if (currentTime < task.arrivalTime) {
          currentTime = task.arrivalTime;
        }

        const start = currentTime;
        const end = start + task.burstTime;
        gantt.push({
          task,
          start,
          end,
          color: getColorByTaskId(task.id),
          responseTime: start - task.arrivalTime,
        });
        totalResponseTime += start - task.arrivalTime;
        currentTime = end;

        queue.splice(queue.indexOf(task), 1);
      }
    } else if (algorithm === "RR") {
      setExplanation("RR: Round Robin");
      const queue = [...taskList];
      while (queue.length > 0) {
        const task = queue.shift();
        if (currentTime < task.arrivalTime) {
          currentTime = task.arrivalTime;
        }

        const start = currentTime;
        const executionTime = Math.min(task.burstTime, quantum);
        const end = start + executionTime;
        gantt.push({
          task,
          start,
          end,
          color: getColorByTaskId(task.id),
          responseTime: start - task.arrivalTime,
        });
        totalResponseTime += start - task.arrivalTime;
        currentTime = end;

        if (task.burstTime > quantum) {
          queue.push({
            ...task,
            burstTime: task.burstTime - quantum,
            arrivalTime: currentTime,
          });
        }
      }
    }

    setGanttChart(gantt);
    setAverageResponseTime(totalResponseTime / taskList.length);
  };

  const chartData = {
    labels: ["Task Running Status"],
    datasets: ganttChart.map((entry) => ({
      label: `Task ${entry.task.id}`,
      data: [{ x: [entry.start, entry.end], y: 1 }],
      backgroundColor: entry.color,
      borderColor: "black",
      borderWidth: 1,
      barPercentage: 1.0,
      categoryPercentage: 1.0,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    scales: {
      x: {
        title: {
          display: true,
          text: "Time (Sec)",
        },
        ticks: {
          stepSize: 1,
        },
      },
      y: {
        ticks: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: "right",
      },
    },
  };

  return (
    <div className="App">
      <h1>Learning CPU Scheduling!</h1>
      <div>
        <div>
          <label>Arrival Time: </label>
          <input
            type="number"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
          />
        </div>
        <div>
          <label> Burst Time: </label>
          <input
            type="number"
            value={burstTime}
            onChange={(e) => setBurstTime(e.target.value)}
          />
        </div>
        <button onClick={addTask}>Add Task</button>
      </div>

      <div>
        <label>Select Algorithm: </label>
        <select
          value={algorithm}
          onChange={(e) => {
            setAlgorithm(e.target.value);
            setTasks([]);
            setGanttChart([]);
          }}
        >
          <option value="FCFS">FCFS</option>
          <option value="SJF">SJF</option>
          <option value="RR">RR</option>
        </select>
        <p>{explanation}</p>
      </div>
      <h2>Average Response Time: {averageResponseTime.toFixed(2)}Sec</h2>
      <h2>Task List</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            Task {task.id}: ArrivalTime {task.arrivalTime}, Burst Time{" "}
            {task.burstTime}
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={() => setShowGraph(true)}>Run Graph</button>
      {showGraph && (
        <div>
          <h2>Graph</h2>
          <div style={{ height: "300px" }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
