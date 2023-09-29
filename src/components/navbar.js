import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faReact } from '@fortawesome/free-brands-svg-icons'
import React, { useState, useEffect } from 'react';

function Navbar() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <Link to="/" className="navbar__brand">
          <FontAwesomeIcon icon={faReact} className="navbar__brand-icon" />
          <span className="navbar__brand-text">REACT DATABASE MANAGEMENT</span>
        </Link>
        <div className="navbar__menu">
          {/*<Link to="/" className="navbar__menu-link">Home</Link>*/}
        </div>
      </div>

        <div className="navbar__date">
          <span className="navbar__date-date">{date.toLocaleDateString()}</span>
        </div>

    </nav>
  );
}

export default Navbar;
