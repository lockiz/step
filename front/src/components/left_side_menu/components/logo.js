import React from 'react';

const LogoMenuLeftSide = ({ collapsed }) => {
    return (
        <div
            style={{
                fontSize: collapsed ? '12px' : '16px', // Меняем размер текста
                fontWeight: 'bold',
                textAlign: 'center',
                transition: 'all 0.3s ease', // Плавный переход
            }}
        >
            {collapsed ? '3D' : '3D_СТРОЙ'}
        </div>
    );
};

export default LogoMenuLeftSide;
