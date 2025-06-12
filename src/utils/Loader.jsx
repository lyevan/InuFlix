import React from "react";
import styled from "styled-components";

const Loader = () => {
  return (
    <div className="w-screen h-full flex items-center justify-center">
      <StyledWrapper>
        <div className="loader">
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </div>

      </StyledWrapper>
    </div>
  );
};

const StyledWrapper = styled.div`
  .loader {
    display: flex;
    align-items: center;
  }

  .bar {
    display: inline-block;
    width: 6px;
    height: 40px;
    background-color: rgba(29, 205, 159, 0.3);
    border-radius: 10px;
    animation: scale-up4 1s linear infinite;
  }

  .bar:nth-child(2) {
    height: 35px;
    margin: 0 5px;
    animation-delay: 0.25s;
  }

  .bar:nth-child(3) {
    animation-delay: 0.5s;
  }

  @keyframes scale-up4 {
    20% {
      background-color: #1dcd9f;
      transform: scaleY(1.5);
    }

    40% {
      transform: scaleY(1);
    }
  }
`;

export default Loader;
