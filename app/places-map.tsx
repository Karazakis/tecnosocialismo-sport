"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import type { Place } from "@/lib/model";

export function PlacesMap({places,selectedId,onSelect,onPick,pickMode}:{places:Place[];selectedId:string|null;onSelect:(id:string)=>void;onPick:(latitude:number,longitude:number)=>void;pickMode:boolean}){
  const selected=places.find(place=>place.id===selectedId);
  return <MapContainer center={[42.35,12.45]} zoom={6} minZoom={3} scrollWheelZoom className="places-leaflet" zoomControl attributionControl>
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
    <MapControl selected={selected} pickMode={pickMode} onPick={onPick}/>
    {places.map(place=><CircleMarker center={[place.latitude,place.longitude]} radius={place.id===selectedId?13:9} pathOptions={{color:place.id===selectedId?"#ecff63":"#0d1712",weight:3,fillColor:place.rating>=4?"#b9ec63":"#62dfd3",fillOpacity:1}} eventHandlers={{click:()=>onSelect(place.id)}} key={place.id}><Tooltip direction="top" offset={[0,-8]}><b>{place.name}</b><br/>{place.city} · {place.ratingCount?`${place.rating.toFixed(1)} ★`:"Nuovo"}</Tooltip></CircleMarker>)}
  </MapContainer>;
}

function MapControl({selected,pickMode,onPick}:{selected?:Place;pickMode:boolean;onPick:(latitude:number,longitude:number)=>void}){
  const map=useMap();
  useEffect(()=>{if(selected)map.flyTo([selected.latitude,selected.longitude],14,{duration:.8})},[map,selected]);
  useMapEvents({click:event=>{if(pickMode)onPick(Number(event.latlng.lat.toFixed(6)),Number(event.latlng.lng.toFixed(6)))}});
  return null;
}
