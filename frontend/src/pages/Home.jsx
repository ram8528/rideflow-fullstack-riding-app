import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/Rideflow-logo.png";
import home_img from "../assets/Rideflow-home.png";

const Home = () => {
  return (
    <div>
      <div
        className="bg-cover bg-center h-screen flex justify-between flex-col w-full"
        style={{
          backgroundImage: `url(${home_img})`,
        }}
      >
        <img className="w-16 ml-8" src={logo} alt="" />
        <div className="bg-white pb-8 py-4 px-4">
          <h2 className="text-[30px] font-semibold">
            Get Started with RideFlow
          </h2>
          <Link
            to="/login"
            className="flex items-center justify-center w-full bg-black text-white py-3 rounded-lg mt-5"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
