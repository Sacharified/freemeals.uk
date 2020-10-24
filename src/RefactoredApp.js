import React, { useEffect, useState } from "react";
import L from "leaflet";
import { Map, TileLayer, Marker } from "react-leaflet";
import fetch from "node-fetch";
import styled from "styled-components";

import Block from "./components/Block";
import Header from "./components/Header";
import LocationFilter from "./components/LocationFilter";
import ProviderList from "./components/ProviderList";

import {
  CLOSE_TIME,
  INSTRUCTIONS,
  MARCUS_SOURCE_URL,
  NAME,
  OFFERS,
  OFFER_DAYS,
  OPEN_TIME,
  PROVIDER_SOURCE_URL,
  URL,
} from "./constants";

import "./App.css";

const Container = styled.div`
  display: flex;
  padding: 10px;
  position: relative;
`;

const SelectedPane = styled.div`
  flex: 2;
  min-width: 50%;
  margin-left: 20px;
  background: white;
  height: 100vh;
  padding: 10px;
  overflow-y: scroll;
  @media screen and (min-width: 600px) {
    display: block;
    max-width: 50%;
  }
  @media screen and (max-width: 600px) {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 1000;
    width: 75%;
  }
  ${(props) =>
    props.isMapMode &&
    `
    position: absolute;
    top: 0;
    right: 0;
    z-index: 500;
  `}
`;

const CloseButton = styled.button`
  cursor: pointer;
  background: #85de77;
  color: white;
  appearance: none;
  border: none;
  padding: 5px;
  border-radius: 20px;
  &:hover {
    background: #65de77;
  }
`;

const Overlay = styled.div`
  @media screen and (min-width: 600px) {
    display: none;
  }
  background: black;
  opacity: 0.5;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
`;

const MapContainer = styled.div`
  position: relative;
  flex: 3;
  height: 100vh;
`;

const ContributingFooter = styled.div`
  display: flex;
  box-sizing: border-box;
  justify-content: space-between;
  position: fixed;
  z-index: 999;
  width: 100%;
  bottom: 0;
  padding: 10px;
  background: #aaa;
  color: white;
  font-weight: bold;
  a {
    color: white;
  }
  button {
    appearance: none;
    background: white;
    color: #aaa;
    border: white;
  }
`;

const DEFAULT_UK_MAP_PROPS = { coords: [55.378052, -3.435973], zoom: 6 };

function App() {
  const [mode, setMode] = useState("list");
  const [data, setData] = useState([]);

  const [markers, setMarkers] = useState();

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [mapProps, setMapProps] = useState(DEFAULT_UK_MAP_PROPS);
  const [footerVisible, setFooterVisible] = useState(true);

  useEffect(() => {
    setSelectedIndex(null);
    fetch(`.netlify/functions/providers?location=${selectedLocation}`)
      .then((response) => response.json())
      .then(async (data) => {
        // eslint-disable-next-line no-unused-vars
        const [first, ...results] = data;
        setData(selectedLocation === "All" ? results : [first, ...results]);
        setMapProps(
          selectedLocation === "All"
            ? DEFAULT_UK_MAP_PROPS
            : { coords: [first["latitude"], first["longitude"]], zoom: 12 }
        );
        console.log(data);

        if (!locations.length) {
          const locationSet = new Set();
          data.forEach((provider) => {
            locationSet.add(provider["provider town/city"]);
          });
          setLocations(["All", ...locationSet]);
          console.log(locationSet);
        }
      });
  }, [selectedLocation, locations.length]);

  useEffect(() => {
    (async () => {
      const customIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png",
        iconSize: [35, 46],
        iconAnchor: [17, 46],
      });

      if (data.length) {
        setMarkers(
          data.map((provider, i) => {
            if (!provider.latitude) {
              provider.latitude = 56 - i * 0.05;
              provider.longitude = -5 + i * 0.05;
            }

            let position = [provider.latitude, provider.longitude];

            return (
              <Marker
                key={i}
                position={position}
                icon={customIcon}
                onClick={() => handleProviderClick(i)}
              />
            );
          })
        );
      }
    })();
  }, [data, mode]);

  const handleProviderClick = (i) => {
    setSelectedIndex(i);
  };

  const handleModeChange = (mode) => {
    setMode(mode);
    setSelectedIndex(null);
  };

  const buildAddressString = (provider) => {
    const ADDRESS_1 = provider["provider address 1"];
    const ADDRESS_2 = provider["provider address 2"];
    const COUNTY = provider["provider county"];
    const TOWN = provider["provider town/city"];
    const POSTCODE = provider["provider postcode"];

    const addressArray = [ADDRESS_1, ADDRESS_2, COUNTY, TOWN, POSTCODE].filter(
      (parts) => parts !== "Not Available" && parts
    );
    return addressArray.join(", ");
  };

  return (
    <>
      <Header handleModeChange={handleModeChange} mode={mode} />
      <Container>
        <LocationFilter
          locations={locations}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />
        {mode === "list" ? (
          <ProviderList
            buildAddressString={buildAddressString}
            data={data}
            handleProviderClick={handleProviderClick}
            selectedIndex={selectedIndex}
          />
        ) : (
          <MapContainer>
            <div
              style={{
                display: "block",
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                zIndex: 100,
              }}
            >
              <Map
                center={mapProps.coords}
                zoom={mapProps.zoom}
                className="leaflet-map"
              >
                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers}
              </Map>
            </div>
          </MapContainer>
        )}
        {data.length && selectedIndex != null ? (
          <SelectedPane isMapMode={mode === "map"}>
            <small>
              <CloseButton onClick={() => setSelectedIndex(null)}>
                Close
              </CloseButton>
            </small>
            <div style={{ height: "50%", width: "100%" }}>
              {[
                data[selectedIndex]["latitude"] &&
                  data[selectedIndex]["longitude"],
              ] ? (
                <Map
                  center={[
                    data[selectedIndex]["latitude"],
                    data[selectedIndex]["longitude"],
                  ]}
                  zoom={20}
                  className="leaflet-map"
                >
                  <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {markers}
                </Map>
              ) : null}
            </div>
            <h2>{data[selectedIndex][NAME]}</h2>
            <Block>
              <strong>Description</strong>:{" "}
              {data[selectedIndex][OFFERS] || "???"}
            </Block>
            <Block>
              <strong>Availability</strong>:
            </Block>
            <ul style={{ margin: 0 }}>
              <li>
                Times: {data[selectedIndex][OPEN_TIME] || "Not specified"} -{" "}
                {data[selectedIndex][CLOSE_TIME] || "Not specified"}
              </li>
              <li>
                Days: {data[selectedIndex][OFFER_DAYS] || "Not specified"}
              </li>
            </ul>
            <Block>
              <strong>How to claim</strong>:{" "}
              {data[selectedIndex][INSTRUCTIONS] || "???"}
            </Block>
            <Block>
              <strong>Website</strong>:{" "}
              <a href={data[selectedIndex][URL]}>
                {data[selectedIndex][URL] || "???"}
              </a>
            </Block>
            <Block>
              <strong>Location</strong>:{" "}
              <a
                href={`https://www.google.co.uk/maps/place/${buildAddressString(
                  data[selectedIndex]
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {buildAddressString(data[selectedIndex])}
              </a>
            </Block>
            <Block>
              <strong>Source</strong>:{" "}
              <a href={data[selectedIndex][MARCUS_SOURCE_URL]}>
                {data[selectedIndex][MARCUS_SOURCE_URL]}
              </a>
              ,{" "}
              <a href={data[selectedIndex][PROVIDER_SOURCE_URL]}>
                {data[selectedIndex][PROVIDER_SOURCE_URL]}
              </a>
            </Block>
          </SelectedPane>
        ) : null}
      </Container>
      {selectedIndex != null && <Overlay />}
      {footerVisible && (
        <ContributingFooter>
          <span>
            <span role="img" aria-label="Wave">
              👋
            </span>{" "}
            Hi there! If you'd like to contribute, head over to the{" "}
            <a href="https://github.com/tomoakley/freemeals.uk">Github repo</a>{" "}
            or the{" "}
            <a href="https://docs.google.com/spreadsheets/d/1OaRn7UHsFpFLOfTeiUnIBr7ofjcemBEvf_gl5b1PoTY/edit#gid=593288514">
              Google Sheet
            </a>
            . Thanks!
          </span>{" "}
          <button onClick={() => setFooterVisible(false)}>Hide</button>
        </ContributingFooter>
      )}
    </>
  );
}

export default App;
