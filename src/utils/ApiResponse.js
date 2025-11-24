class ApiResponse {
  constructor(statusCode, data, message) {
    this.success = true;
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
  }
}

export { ApiResponse };
