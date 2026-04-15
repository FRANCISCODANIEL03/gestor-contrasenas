import { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // VERIFICAR TOKEN AL INICIAR
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch("http://localhost/api1/api/users/verify", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.valid) {
            setCurrentUser(data.user); // data.user contiene { userId, username }
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Error validando sesión:", error);
        }
      }
    };
    checkSession();
  }, []);

  const handleLogin = (user, token) => {
    setCurrentUser(user);
    localStorage.setItem("token", token); // Guardamos el JWT real
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");
  };

  return (
    <>
      <button
        onClick={toggleTheme}
        className="btn-icon"
        style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1000 }}
        title="Alternar tema claro/oscuro"
      >
        {theme === "light" ? (
          <i className="fa-solid fa-moon"></i>
        ) : (
          <i className="fa-solid fa-sun"></i>
        )}
      </button>

      {currentUser ? (
        <Dashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          showToast={showToast}
        />
      ) : (
        <Auth onLogin={handleLogin} showToast={showToast} />
      )}

      {toastMessage && <div className="toast">{toastMessage}</div>}
    </>
  );
}

export default App;
