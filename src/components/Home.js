import React from "react";
import {useLocation, useNavigator } from "../react-router";
function Home() {
  let navigate = useNavigator();
  let location = useLocation();
  console.log('Home', navigate, location);
  
  function handler() {
    console.log('go about');
    navigate('/about/111');
  }

  return (
    <div>
      <h1>Home</h1>
      <button onClick={ handler }>Go About</button>
    </div>
  );
}

export default Home;