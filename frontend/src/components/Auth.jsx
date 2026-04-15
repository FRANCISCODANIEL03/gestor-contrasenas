import { useState } from 'react';
import './auth-sliding.css';

export default function Auth({ onLogin, showToast }) {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  // Sign In State
  const [signInUser, setSignInUser] = useState('');
  const [signInPass, setSignInPass] = useState('');
  const [showSignInPass, setShowSignInPass] = useState(false);

  // Sign Up State
  const [signUpUser, setSignUpUser] = useState('');
  const [signUpPass, setSignUpPass] = useState('');
  const [showSignUpPass, setShowSignUpPass] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!signInUser || !signInPass) {
      if (showToast) showToast("Por favor completa todos los campos.");
      return;
    }

    try {
      const res = await fetch("http://localhost/api1/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: signInUser, password: signInPass }),
      });

      const data = await res.json();

      if (res.ok) {
        // onLogin ahora recibe el usuario y el JWT
        onLogin({ username: signInUser }, data.token);
      } else {
        if (showToast) showToast(data.error || "Credenciales incorrectas");
      }
    } catch (error) {
      if (showToast) showToast("Error al conectar con el servidor");
      console.log(error);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signUpUser || !signUpPass) {
      if (showToast) showToast("Por favor completa todos los campos.");
      return;
    }

    try {
      const res = await fetch("http://localhost/api1/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: signUpUser, password: signUpPass }),
      });

      const data = await res.json();

      if (res.ok) {
        if (showToast) showToast("¡Cuenta creada! Ahora inicia sesión.");
        setSignUpUser("");
        setSignUpPass("");
        setIsRightPanelActive(false);
      } else {
        if (showToast) showToast(data.error || "No se pudo crear la cuenta");
      }
    } catch (error) {
      if (showToast) showToast("Error al conectar con el servidor");
      console.log(error);
    }
  };

  return (
    <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="auth-box">
      
      {/* Sign Up Form */}
      <div className="form-container sign-up-container">
        <form className="auth-form" onSubmit={handleSignUp}>
          <h1>Crear Cuenta</h1>
          <p>Usa tu información para registrarte</p>
          
          <div className="auth-input-container">
            <i className="fa-solid fa-user icon-prefix" style={{ position: 'absolute', left: '15px' }}></i>
            <input 
              type="text" 
              placeholder="Nombre de Usuario" 
              value={signUpUser}
              onChange={e => setSignUpUser(e.target.value)}
              required 
            />
          </div>
          
          <div className="auth-input-container">
            <i className="fa-solid fa-lock icon-prefix" style={{ position: 'absolute', left: '15px' }}></i>
            <input 
              type={showSignUpPass ? "text" : "password"}
              placeholder="Contraseña" 
              value={signUpPass}
              onChange={e => setSignUpPass(e.target.value)}
              required 
              style={{ paddingRight: '40px' }}
            />
            <button 
              type="button" 
              onClick={() => setShowSignUpPass(!showSignUpPass)}
              style={{ position: 'absolute', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <i className={`fa-solid ${showSignUpPass ? 'fa-eye-slash' : 'fa-eye'}`} style={{ position: 'static', transform: 'none' }}></i>
            </button>
          </div>
          
          <button type="submit" className="auth-btn">Registrarse</button>
        </form>
      </div>

      {/* Sign In Form */}
      <div className="form-container sign-in-container">
        <form className="auth-form" onSubmit={handleSignIn}>
          <h1>Iniciar Sesión</h1>
          <p>Accede con tus credenciales guardadas</p>
          
          <div className="auth-input-container">
            <i className="fa-solid fa-user icon-prefix" style={{ position: 'absolute', left: '15px' }}></i>
            <input 
              type="text" 
              placeholder="Nombre de Usuario" 
              value={signInUser}
              onChange={e => setSignInUser(e.target.value)}
              required 
            />
          </div>
          
          <div className="auth-input-container">
            <i className="fa-solid fa-key icon-prefix" style={{ position: 'absolute', left: '15px' }}></i>
            <input 
              type={showSignInPass ? "text" : "password"}
              placeholder="Contraseña" 
              value={signInPass}
              onChange={e => setSignInPass(e.target.value)}
              required 
              style={{ paddingRight: '40px' }}
            />
            <button 
              type="button" 
              onClick={() => setShowSignInPass(!showSignInPass)}
              style={{ position: 'absolute', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <i className={`fa-solid ${showSignInPass ? 'fa-eye-slash' : 'fa-eye'}`} style={{ position: 'static', transform: 'none' }}></i>
            </button>
          </div>
          
          <button type="submit" className="auth-btn">Entrar</button>
        </form>
      </div>

      {/* Overlay Animations */}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1 style={{ color: '#fff' }}>¡Bienvenido!</h1>
            <p style={{ color: '#fff', fontSize: '15px', marginTop: '20px', marginBottom: '30px' }}>Inicia sesión con tu cuenta personal.</p>
            <button className="auth-btn ghost" onClick={() => setIsRightPanelActive(false)}>Iniciar Sesión</button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1 style={{ color: '#fff' }}>¿Nuevo?</h1>
            <p style={{ color: '#fff', fontSize: '15px', marginTop: '20px', marginBottom: '30px' }}>Crea tu bóveda registrando tu nueva cuenta aquí.</p>
            <button className="auth-btn ghost" onClick={() => setIsRightPanelActive(true)}>Registrarse</button>
          </div>
        </div>
      </div>
    </div>
  );
}
