import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { authAPI } from "../services/api";

function Signin() {
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("grant_type", "password");
      formData.append("client_id", "string");
      formData.append("client_secret", "string");
      formData.append("scope", "");

      const response = await authAPI.login(formData);
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      history.push("/home");
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid username or password");
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ width: "100vw", height: "100vh" }}
    >
      <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="text-danger">{error}</div>}
        <button
          type="submit"
          className="btn"
          style={{ color: "white", backgroundColor: "black" }}
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

export default Signin;
