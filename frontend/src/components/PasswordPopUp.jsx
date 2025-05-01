import { useState } from "react";
import "./PasswordPopUp.css";

export default function PasswordPopUp({ isOpen, onSubmit, onCancel, title }) {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(password);
    setPassword("");
  };

  const handleCancel = () => {
    onCancel();
    setPassword("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{title}</h3>
        <input
          type="password"
          placeholder="Type your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={handleSubmit}>Accept</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}