"use client";

//react/next.js用ライブラリ
import { useState, useEffect, useRef } from "react";

//googleMap
import {
GoogleMap,
Marker,
OverlayView,
useJsApiLoader,
} from "@react-google-maps/api";

//データベース関連
import { supabase } from '@/app/utils/supabase/supabaseClient';

const mapContainerStyle = { width: "100%", height: "100%" };

export default function HostTop({ setSelectPost, setPostBtn, openDialog, setOpenDialog }) {

	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey : "AIzaSyA1pKp1urhDvyKNJfX22TPMTf9PNrkGO6c",
		libraries        : ["places"],
		language         : "ja",
	});
	const [currentPosition, setCurrentPosition] = useState(null);
	const [mapCenter, setMapCenter]             = useState(null);
	const [allPosts, setAllPosts]               = useState([]);
	const mapRef                                = useRef(null);
	const inputRef                              = useRef(null);
	const autocompleteRef                       = useRef(null);
	const mapOptions                            = {
		disableDefaultUI: true, 
		gestureHandling: "greedy"
	};

	// 現在地リアルタイム
	useEffect(() => {
		if (!navigator.geolocation) {
			setMapCenter({ lat: 35.681236, lng: 139.767125 });
			return;
		}

		const watchId = navigator.geolocation.watchPosition(
			(position) => {
				const newPos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				};
				setCurrentPosition(newPos);

				// 初回だけ地図を現在地に移動
				setMapCenter((prev) => prev ?? newPos);
			},
			(error) => {
				console.error("位置情報エラー:", error);
				// タイムアウトなどで位置取得できなかった場合も、地図は表示
				setMapCenter({ lat: 35.681236, lng: 139.767125 });
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
		);

		return () => navigator.geolocation.clearWatch(watchId);
	}, []);


	// Google Maps API読み込み完了後にAutocompleteセットアップ
	useEffect(() => {
		if (isLoaded && window.google && inputRef.current) {
			autocompleteRef.current = new window.google.maps.places.Autocomplete(
				inputRef.current,
				{
					// types: ["establishment"], // 必要に応じて絞り込み
					// componentRestrictions: { country: "jp" }, // 日本国内に絞る場合
				}
			);

			autocompleteRef.current.addListener("place_changed", () => {
				const place = autocompleteRef.current.getPlace();
				if (!place.geometry || !place.geometry.location) {
					alert("検索結果に場所が見つかりませんでした");
					return;
				}

				const location = {
					lat: place.geometry.location.lat(),
					lng: place.geometry.location.lng(),
				};
				setMapCenter(location);
			});
		}	
	}, [isLoaded]);

	useEffect(() => {
		const fetchPosts = async () => {
			const { data, error } = await supabase.from("groups").select("*");
			if (error) {
				console.error("投稿データ取得エラー:", error);
			} else {
				setAllPosts(data);
			}
		};

		fetchPosts();
	}, []);

	if (!isLoaded) return <div>マップを読み込み中...</div>;

	//修正後：mapCenterがあれば表示（位置取得失敗時も含む）
	if (!mapCenter) return <div>地図を読み込み中...</div>;

	return (
		<div className="w-[100%] h-[100%] relative">

			{/* 検索ボックス */}
			<input
				ref={inputRef}
				type="text"
				placeholder="場所を検索"
				className="absolute top-[10px] left-[calc(50%-160px)] bg-[#fff] w-[320px] h-[40px] px-[20px] text-[14px] rounded-[100px] shadow-md z-10"
			/>

			<GoogleMap
			center={mapCenter}
			zoom={15}
			mapContainerStyle={mapContainerStyle}
			onLoad={(map) => (mapRef.current = map)}
			options={mapOptions}
			>
				{/* 現在地のマーカー */}
				<Marker position={currentPosition} label="" />

				{/* 投稿のマーカー */}
				{allPosts.map((post) => (
					<OverlayView
						key         = {post.id}
						position    = {{ lat: post.lat, lng: post.lng }}
						mapPaneName = {OverlayView.OVERLAY_MOUSE_TARGET}
						
					>
						<div onClick={() => setSelectPost(post.id)} className="post-marker">
							<div className="post-image" style={{backgroundImage: `url(${post.image_url})`}}></div>
						</div>
					</OverlayView>
				))}

				<div
				onClick={() => {
					if (mapRef.current && currentPosition) {
					mapRef.current.setCenter(currentPosition); // 地図の中心を現在地へ
					}
				}}
				className="now-location-button"
				>
				</div>

			</GoogleMap>

		</div>
	);
}
