
const BASE_URL = "http://localhost:8082";

// Auth APIs
export const LOGIN = `${BASE_URL}/auth/login`;
export const REGISTER = `${BASE_URL}/auth/register`; // if you have register

// Users APIs
export const GET_USERS = `${BASE_URL}/users`;
export const GET_USER_BY_ID = (id: number | string) => `${BASE_URL}/users/${id}`;
export const CREATE_USER = `${BASE_URL}/users`;
export const UPDATE_USER = (id: number | string) => `${BASE_URL}/users/${id}`;
export const DELETE_USER = (id: number | string) => `${BASE_URL}/users/${id}`;

// Roles APIs
export const GET_ROLES = `${BASE_URL}/roles`;
export const GET_ROLE_BY_ID = (id: number | string) => `${BASE_URL}/roles/${id}`;
export const CREATE_ROLE = `${BASE_URL}/roles`;
export const UPDATE_ROLE = (id: number | string) => `${BASE_URL}/roles/${id}`;
export const DELETE_ROLE = (id: number | string) => `${BASE_URL}/roles/${id}`;

// Quizzes APIs (example if you have them)
export const GET_QUIZZES = `${BASE_URL}/quizzes`;
export const GET_QUIZ_BY_ID = (id: number | string) => `${BASE_URL}/quizzes/${id}`;
export const CREATE_QUIZ = `${BASE_URL}/quizzes`;
export const UPDATE_QUIZ = (id: number | string) => `${BASE_URL}/quizzes/${id}`;
export const DELETE_QUIZ = (id: number | string) => `${BASE_URL}/quizzes/${id}`;

// Questions APIs (example)
export const GET_QUESTIONS = `${BASE_URL}/questions`;
export const GET_QUESTION_BY_ID = (id: number | string) => `${BASE_URL}/questions/${id}`;
export const CREATE_QUESTION = `${BASE_URL}/questions`;
export const UPDATE_QUESTION = (id: number | string) => `${BASE_URL}/questions/${id}`;
export const DELETE_QUESTION = (id: number | string) => `${BASE_URL}/questions/${id}`;

// Helper function to log all endpoints
export const logAllEndpoints = (): void => {
  console.log("AUTH:");
  console.log("LOGIN:", LOGIN);
  console.log("REGISTER:", REGISTER);

  console.log("USERS:");
  console.log("GET_USERS:", GET_USERS);
  console.log("GET_USER_BY_ID:", GET_USER_BY_ID(":id"));
  console.log("CREATE_USER:", CREATE_USER);
  console.log("UPDATE_USER:", UPDATE_USER(":id"));
  console.log("DELETE_USER:", DELETE_USER(":id"));

  console.log("ROLES:");
  console.log("GET_ROLES:", GET_ROLES);
  console.log("GET_ROLE_BY_ID:", GET_ROLE_BY_ID(":id"));
  console.log("CREATE_ROLE:", CREATE_ROLE);
  console.log("UPDATE_ROLE:", UPDATE_ROLE(":id"));
  console.log("DELETE_ROLE:", DELETE_ROLE(":id"));

  console.log("QUIZZES:");
  console.log("GET_QUIZZES:", GET_QUIZZES);
  console.log("GET_QUIZ_BY_ID:", GET_QUIZ_BY_ID(":id"));
  console.log("CREATE_QUIZ:", CREATE_QUIZ);
  console.log("UPDATE_QUIZ:", UPDATE_QUIZ(":id"));
  console.log("DELETE_QUIZ:", DELETE_QUIZ(":id"));

  console.log("QUESTIONS:");
  console.log("GET_QUESTIONS:", GET_QUESTIONS);
  console.log("GET_QUESTION_BY_ID:", GET_QUESTION_BY_ID(":id"));
  console.log("CREATE_QUESTION:", CREATE_QUESTION);
  console.log("UPDATE_QUESTION:", UPDATE_QUESTION(":id"));
  console.log("DELETE_QUESTION:", DELETE_QUESTION(":id"));
};
