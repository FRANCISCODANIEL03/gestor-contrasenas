import { useState, useEffect } from "react";
import PasswordForm from "./PasswordForm";
import PasswordUtilities from "./PasswordUtilities";
import Vault from "./Vault";

export default function Dashboard({ currentUser, onLogout, showToast }) {
  const [passwords, setPasswords] = useState([]);
  // NUEVO ESTADO: Controla qué ID se va a eliminar. Si es null, el modal está oculto.
  const [itemToDelete, setItemToDelete] = useState(null);

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
          const mappedData = data.map((item) => ({
            id: item._id,
            site: item.website_name,
            email: item.email_or_username,
            pass: item.password,
          }));
          setPasswords(mappedData);
        } else if (res.status === 401 || res.status === 403) {
          onLogout();
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
        body: JSON.stringify({
          website_name: newEntry.site,
          email_or_username: newEntry.email,
          password: newEntry.pass,
        }),
      });

      if (res.ok) {
        const data = await res.json();
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

  // PASO 1: Preparar la eliminación (abre el modal)
  const handleDeletePassword = (id) => {
    setItemToDelete(id);
  };

  // PASO 2: Ejecutar la eliminación tras confirmar en el modal
  const executeDelete = async () => {
    if (!itemToDelete) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/${itemToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setPasswords(passwords.filter((p) => p.id !== itemToDelete));
        if (showToast) showToast("Credencial eliminada");
      }
    } catch (error) {
      if (showToast) showToast("Error al eliminar");
    } finally {
      // Siempre cerramos el modal al terminar, haya éxito o error
      setItemToDelete(null);
    }
  };

  // Cancelar la eliminación (cierra el modal)
  const cancelDelete = () => {
    setItemToDelete(null);
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
    <>
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
          onDelete={handleDeletePassword} // Ahora solo actualiza el estado, no borra de inmediato
          onEdit={handleEditPassword}
          showToast={showToast}
        />
      </main>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {itemToDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="glass-panel active"
            style={{
              padding: "30px",
              borderRadius: "20px",
              textAlign: "center",
              backgroundColor: "var(--panel-bg)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <i
              className="fa-solid fa-triangle-exclamation"
              style={{
                fontSize: "3.5rem",
                color: "#ef4444",
                marginBottom: "15px",
              }}
            ></i>
            <h3
              style={{
                marginBottom: "10px",
                color: "var(--text-main)",
                fontSize: "1.5rem",
              }}
            >
              ¿Eliminar credencial?
            </h3>
            <p
              style={{
                marginBottom: "25px",
                color: "var(--text-muted)",
                fontSize: "0.95rem",
              }}
            >
              Esta acción no se puede deshacer. La contraseña se borrará
              permanentemente de tu boveda.
            </p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "15px" }}
            >
              <button
                className="btn-primary"
                onClick={cancelDelete}
                style={{
                  background: "transparent",
                  border: "1px solid var(--text-muted)",
                  color: "var(--text-main)",
                }}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={executeDelete}
                style={{ background: "#ef4444", border: "1px solid #ef4444" }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
