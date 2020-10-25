import React from "react";
import styled from "styled-components";

import FooterLogo from "images/footer.svg";

function ContributingFooter({ setFooterVisible }) {
  return (
    <ContributingFooterContainer>
      <img src={FooterLogo} alt={"#FREESCHOOLMEALS"} />
      <p>
        <span role="img" aria-label="Wave" style={{ marginRight: 10 }}>
          👋
        </span>{" "}
        Hi there! If you'd like to contribute, head over to the{" "}
        <a href="https://github.com/tomoakley/freemeals.uk">Github repo</a> or
        the{" "}
        <a href="https://docs.google.com/spreadsheets/d/1OaRn7UHsFpFLOfTeiUnIBr7ofjcemBEvf_gl5b1PoTY/edit#gid=593288514">
          Google Sheet
        </a>
        . Thanks!
      </p>{" "}
      <button>Add your venue</button>
    </ContributingFooterContainer>
  );
}

const ContributingFooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #ba0d37;
  color: #fff;
  padding: 20px;
  z-index: 10;
  @media screen and (min-width: 768px) {
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
  }
  @media screen and (min-width: 1000px) {
    position: sticky;
    bottom: 25px;
  }
  img {
    margin-bottom: 10px;
    object-fit: contain;
    @media screen and (min-width: 768px) {
      margin-bottom: 0;
      margin-right: 15px;
    }
  }

  p {
    font-size: 14px;
    margin: 0 0 10px;
    @media screen and (min-width: 768px) {
      margin-bottom: 0;
      margin-right: 15px;
    }
    a {
      color: #fff;
    }
  }

  button {
    background: #000;
    border: 0;
    box-shadow: none;
    color: #fff;
    font-weight: 700;
    padding: 10px 20px;
    text-transform: uppercase;
    max-width: 240px;
    flex-shrink: 0;
  }
`;

export default ContributingFooter;
