import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/navbar";
import Scripts from "./db/scripts";

const App = () => {
    return (
      <>
      <Router>
        <Navbar />

        <Routes>
          <Route path="" element={<Scripts />}></Route>
          <Route path="/Home" element={<Scripts/>}></Route>
        </Routes>

      </Router>

    </>
      
    );
    
  }

export default App;
