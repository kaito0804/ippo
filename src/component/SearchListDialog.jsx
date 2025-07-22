"use client";

import { useEffect, useRef } from 'react';
import { areaList, themeList } from '@/utils/data/groupList';

export default function SearchListDialog({ filters, setFilters, dropdowns, setDropdowns }) {
	const containerRef = useRef(null);

	const toggleDropdown = (key) => {
		setDropdowns((prev) => {
		const newState = { ...prev };
		Object.keys(newState).forEach(k => newState[k] = false);
		newState[key] = !prev[key];
		return newState;
		});
	};

	const selectFilter = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
		setDropdowns({ area: false, theme: false });
	};

	const handleContainerClick = () => {
		if (dropdowns.area || dropdowns.theme) {
		setDropdowns({ area: false, theme: false });
		}
	};

	useEffect(() => {
		const handleClickOutside = (e) => {
		if (containerRef.current && !containerRef.current.contains(e.target)) {
			setDropdowns({ area: false, theme: false });
		}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [setDropdowns]);

	return (
		<div ref={containerRef}>
			<div className="fixed flex items-center w-full gap-[12px] py-[10px] px-[8px] bg-white z-[10]" onClick={handleContainerClick}>

				{/* ▼エリア */}
				<div className="relative">
					<div onClick={(e) => {e.stopPropagation(); toggleDropdown('area');}} className="inline-flex justify-center items-center px-[16px] py-[3px] bg-white border border-[#333] rounded-full text-[12px] cursor-pointer">
						{filters.area ?? 'エリア'}
					</div>
					{dropdowns.area && (
						<ul className="absolute flex flex-col gap-[6px] top-[40px] left-0 w-[150px] bg-white border border-[#333] rounded-[8px] text-[12px] py-[7px]">
							<li onClick={() => selectFilter('area', null)} className={`py-[3px] px-[10px] cursor-pointer ${filters.area === null ? 'bg-gray-200 font-bold' : ''}`}>
								絞り込みしない
							</li>
							{areaList.map((area) => (
								<li key={area} onClick={() => selectFilter('area', area)} className={`py-[3px] px-[10px] cursor-pointer ${filters.area === area ? 'bg-blue-100 font-bold' : ''}`}>
									{area}
								</li>
							))}
						</ul>
					)}
				</div>

				{/* ▼テーマ */}
				<div className="relative">
				<div onClick={(e) => {e.stopPropagation();toggleDropdown('theme');}}className="inline-flex justify-center items-center px-[16px] py-[3px] bg-white border border-[#333] rounded-full text-[12px] cursor-pointer">
					{filters.theme ?? 'テーマ'}
				</div>
				{dropdowns.theme && (
					<ul className="absolute flex flex-col gap-[6px] top-[40px] left-0 w-[150px] bg-white border border-[#333] rounded-[8px] text-[12px] py-[7px]">
						<li onClick={() => selectFilter('theme', null)}className={`py-[3px] px-[10px] cursor-pointer ${filters.theme === null ? 'bg-gray-200 font-bold' : ''}`}>
							絞り込みしない
						</li>
						{themeList.map((theme) => (
							<li key={theme} onClick={() => selectFilter('theme', theme)}className={`py-[3px] px-[10px] cursor-pointer ${filters.theme === theme ? 'bg-blue-100 font-bold' : ''}`}>
								{theme}
							</li>
						))}
					</ul>
				)}
				</div>
			</div>
		</div>
	);
}
