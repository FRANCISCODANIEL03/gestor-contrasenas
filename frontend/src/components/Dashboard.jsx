import { useState, useEffect } from "react";
import PasswordForm from "./PasswordForm";
import PasswordUtilities from "./PasswordUtilities";
import Vault from "./Vault";

export default function Dashboard({ currentUser, onLogout, showToast }) {
  const [passwords, setPasswords] = useState([]);
  const API_URL = "http://localhost/api2/api/vault";

  // CARGAR BÓVEDA DESDE LA BASE DE DATOS
  useEffect(() => {
    const fetchVault = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          // Mapeamos los datos del backend a la estructura que espera tu frontend
          const mappedData = data.map((item) => ({
            id: item._id,
            site: item.website_name,
            
            email: item.email_or_username,
            pass: item.password,
          }));
          setPasswords(mappedData);
        } else if (res.status === 401 || res.status === 403) {
          onLogout(); // Token inválido o expirado
        }
      } catch (error) {
        if (showToast) showToast("Error cargando la bóveda");
        console.log(error);
      }
    };

    fetchVault();
  }, []);

  // AGREGAR NUEVA CONTRASEÑA
  const handleAddPassword = async (newEntry) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Mapeamos a los nombres que espera el Backend
        body: JSON.stringify({
          website_name: newEntry.site,
          email_or_username: newEntry.email,
          password: newEntry.pass,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Agregamos el resultado al estado usando el _id de MongoDB
        setPasswords([
          ...passwords,
          {
            id: data._id,
            site: data.website_name,
            email: data.email_or_username,
            pass: data.password,
          },
        ]);
        if (showToast) showToast("Credencial guardada de forma segura");
      }
    } catch (error) {
      if (showToast) showToast("Error al guardar credencial");
    }
  };

  // ELIMINAR CONTRASEÑA
  const handleDeletePassword = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta credencial?")) {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          setPasswords(passwords.filter((p) => p.id !== id));
          if (showToast) showToast("Credencial eliminada");
        }
      } catch (error) {
        if (showToast) showToast("Error al eliminar");
      }
    }
  };

  // EDITAR CONTRASEÑA
  const handleEditPassword = async (updatedEntry) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/${updatedEntry.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          website_name: updatedEntry.site,
          email_or_username: updatedEntry.email,
          password: updatedEntry.pass,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedList = passwords.map((p) =>
          p.id === data._id
            ? {
                id: data._id,
                site: data.website_name,
                email: data.email_or_username,
                pass: data.password,
              }
            : p,
        );

        setPasswords(updatedList);
        if (showToast) showToast("Credencial actualizada");
      }
    } catch (error) {
      if (showToast) showToast("Error al actualizar");
    }
  };

  return (
    <main
      className="glass-panel active"
      style={{
        maxWidth: "800px",
        display: "block",
        position: "relative",
        margin: "0 auto",
      }}
    >
      <div className="header dashboard-header">
        <div className="title-area">
          <i className="fa-solid fa-shield-halved icon-medium"></i>
          <h2>Bóveda de {currentUser.username}</h2>
        </div>
        <button className="btn-icon" title="Cerrar sesión" onClick={onLogout}>
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>

      <PasswordForm onAdd={handleAddPassword} />

      <PasswordUtilities showToast={showToast} />

      <Vault
        passwords={passwords}
        onDelete={handleDeletePassword}
        onEdit={handleEditPassword}
        showToast={showToast}
      />
    </main>
  );
}
