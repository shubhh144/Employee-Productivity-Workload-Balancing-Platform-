import axios from "axios";

const BASE_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    console.log("🚀 API Request:", config.method?.toUpperCase(), config.url, config.data || "");
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.config?.url, error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login:    (data) => api.post("/auth/login",    { email: data.email, password: data.password }),
  register: (data) => api.post("/auth/register", { name: data.name, email: data.email, password: data.password, role: data.role }),
};

export const taskAPI = {
  getAllTasks:          ()             => api.get("/task/all"),
  createTask:          (data)         => api.post("/task/create", { title: data.title, deadline: data.deadline, priority: data.priority, status: data.status }),
  assignTask:          (taskId, empId)=> api.post(`/task/assign?taskId=${taskId}&employeeId=${empId}`),
  checkGithub:         (taskId)       => api.get(`/github/check/${taskId}`),
  updateGithubDetails: (taskId, data) => api.put(`/task/${taskId}/github-details`, { githubUsername: data.githubUsername, repoName: data.repoName, branchName: data.branchName }),
  // updateTaskStatus removed — GitHub auto updates status
};

export const employeeAPI = {
  getAllEmployees:          ()   => api.get("/employee/all"),
  getEmployeeTasks:        (id) => api.get(`/employee/${id}/tasks`),
  getEmployeeWorkload:     (id) => api.get(`/employee/${id}/workload`),
  getEmployeeProductivity: (id) => api.get(`/employee/${id}/productivity`),
};

export const dashboardAPI = {
  getDashboard:      (employeeId) => api.get(`/dashboard/${employeeId}`),
  getAdminDashboard: ()           => api.get("/dashboard/admin"),
};

export const riskAPI = {
  getDeadlineRisk: () => api.get("/tasks/deadline-risk"),
};

export default api;
