// src/component/slider.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/css';

const GroupSlider = ({ title, groups, setDialogGroup, setImgLoading}) => {

	const [slideWidth, setSlideWidth] = useState(0);
	const slideRef = useRef(null);
	
	const optimizeImage = (url, options = {}) => {
		const { width = 480, height = 300 } = options;
		if (!url.includes('/upload/')) return url;
		const transformation = `w_${width},h_${height},c_fill,f_auto,q_auto`;
		return url.replace('/upload/', `/upload/${transformation}/`);
	};

	/*スライド画像の横幅取得*/
	useEffect(() => {
		if (!slideRef.current) return;

		const img = slideRef.current.querySelector('img');
		if (img && !img.complete) {
		img.onload = () => {
			setSlideWidth(slideRef.current.offsetWidth);
			setImgLoading(true);
		};
		} else {
			// すでに読み込み済みの場合
			setSlideWidth(slideRef.current.offsetWidth);
			setImgLoading(true);
		}
	}, [groups]);

	return (
		<div className="flex flex-col items-center justify-center w-[100%] mt-[40px]">
			<p style={{ width: slideWidth }} className="text-[18px] font-bold">{title}</p>
			{groups.length === 0 ? (
				<li>{title}の開催予定はありません。</li>
			) : (
				<div className="w-[100%] max-w-[600px] mt-[10px]">
					<Splide
						options={ {
							type   : groups.length > 1 ? 'loop' : 'slide',
							gap    : '20px',
							perPage: 1.5,
							perMove: 1,
							focus  : 'center',
							arrows : false,
							speed: 350,       
							flickPower: 50,    
							flickVelocity: 0.3
						} }
					>
						{groups.map((group, idx) => (
							<SplideSlide key={group.id}>
								<div
								ref={idx === 0 ? slideRef : null}
								onClick={() => setDialogGroup(group)}
								className="flex justify-center items-center w-[100%] h-[150px]"
								>
								<div
									className="w-[100%] h-[100%] bg-cover bg-center bg-no-repeat rounded-[10px]"
									style={{ backgroundImage: `url('${optimizeImage(group.image_url)}')` }}
								></div>
								</div>
							</SplideSlide>
						))}
					</Splide>
				</div>
			)}
		</div>
	);
};


export default GroupSlider;
