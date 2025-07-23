// src/component/slider.jsx
import Slider from 'react-slick';

const GroupSlider = ({ title, groups, setSelectPost }) => {

	const settings = {
		dots: true,
		infinite: groups.length > 1,
		speed: 500,
		centerMode: true,
		centerPadding: "60px", // 左右に見える幅（60pxずつ）
		slidesToShow: 1,
		arrows: true,
		responsive: [
			{
			breakpoint: 768,
			settings: {
				centerPadding: "20px",
			},
			},
		],
	};

	// 画像の最適化関数
	const optimizeImage = (url, options = {}) => {
		const { width = 480, height = 300 } = options;
		if (!url.includes('/upload/')) return url;
		const transformation = `w_${width},h_${height},c_fill,f_auto,q_auto`;
		return url.replace('/upload/', `/upload/${transformation}/`);
	};

	return (
		<div className="flex flex-col items-center justify-center w-full mt-[40px]">
			<p className="w-[240px] text-[18px] font-bold">{title}</p>
			{groups.length === 0 ? (
				<li>{title}の開催予定はありません。</li>
			) : (
				<div className="w-full max-w-[600px] mt-[10px] px-4">
					<Slider {...settings}>
						{groups.map((group) => (
							<div onClick={() => setSelectPost(group.id)} key={group.id} className="flex justify-center">
								<div
								className="w-[240px] h-[150px] bg-cover bg-center bg-no-repeat rounded-[10px]"
								style={{ backgroundImage: `url('${optimizeImage(group.image_url)}')` }}
								></div>
							</div>
						))}
					</Slider>
				</div>
			)}
		</div>
	);
};


export default GroupSlider;
