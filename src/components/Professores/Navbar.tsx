import React from "react";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
}

export default function Navbar({ usuario }: Props) {
  return (
    <div
      style={{
        position: "static",
        margin: "-20px auto",
        marginLeft: "-10px",
        width: "250px",
        height: '100vh',
        backgroundColor: "#FFD600",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        justifyContent: "space-between",
      }}
    >
  <div style={{
        display:"flex",
        justifyItems:"center",
        margin:"10px auto",
        fontSize: '30px',
        marginBottom: '-140px',
        }}>
        <svg width="150" height="202" viewBox="0 0 199 202" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M99.5 0C44.576 0 0 45.248 0 101C0 156.752 44.576 202 99.5 202C154.424 202 199 156.752 199 101C199 45.248 154.424 0 99.5 0ZM99.5 30.3C116.017 30.3 129.35 43.834 129.35 60.6C129.35 77.366 116.017 90.9 99.5 90.9C82.983 90.9 69.65 77.366 69.65 60.6C69.65 43.834 82.983 30.3 99.5 30.3ZM99.5 173.72C74.625 173.72 52.6355 160.792 39.8 141.198C40.0985 121.099 79.6 110.09 99.5 110.09C119.3 110.09 158.902 121.099 159.2 141.198C146.365 160.792 124.375 173.72 99.5 173.72Z" fill="white"/>
        </svg>
        </div>
        <div style={{display:"flex",justifyItems:"center",margin:"20px auto",fontSize: '20px'}}>
            {usuario.Nome}
        </div>

      {/* Menu */}
        <nav>
        <div 
          style={{   
            display:"flex",
            flexDirection:"column",
            listStyle: 'none',
            padding: 0,
            marginTop: '-70px',
            gap:"20px"
        }}>
            <div style={{
            // marginLeft: '60px',
            fontSize: '18px',
            cursor: 'pointer',
            display:"flex",
            flexDirection:"row",
            width: '250px',
            }}>
            <div>
            <svg width="35" height="40" viewBox="0 0 43 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.7731 20.25C24.6109 20.25 27.118 21.42 29.155 22.95C31.0353 24.39 32.2192 27.63 32.2192 31.14V36H11.327V31.17C11.327 27.63 12.5108 24.39 14.3911 22.98C16.4281 21.42 18.9352 20.25 21.7731 20.25ZM7.84492 21C9.76004 21 11.327 18.3 11.327 15C11.327 11.7 9.76004 9 7.84492 9C5.92981 9 4.36289 11.7 4.36289 15C4.36289 18.3 5.92981 21 7.84492 21ZM9.81227 24.3C9.1681 24.12 8.52392 24 7.84492 24C6.12132 24 4.48476 24.63 3.0049 25.74C1.71655 26.7 0.880859 28.86 0.880859 31.29V36H8.71543V31.17C8.71543 28.68 9.11587 26.34 9.81227 24.3ZM35.7012 21C37.6163 21 39.1832 18.3 39.1832 15C39.1832 11.7 37.6163 9 35.7012 9C33.7861 9 32.2192 11.7 32.2192 15C32.2192 18.3 33.7861 21 35.7012 21ZM42.6653 31.29C42.6653 28.86 41.8296 26.7 40.5412 25.74C39.0614 24.63 37.4248 24 35.7012 24C35.0222 24 34.378 24.12 33.7338 24.3C34.4302 26.34 34.8307 28.68 34.8307 31.17V36H42.6653V31.29ZM21.7731 0C24.6631 0 26.9961 4.02 26.9961 9C26.9961 13.98 24.6631 18 21.7731 18C18.883 18 16.55 13.98 16.55 9C16.55 4.02 18.883 0 21.7731 0Z" fill="white"/>
            </svg>
            </div>
            <text 
                style={{
                  display:"flex", 
                  justifyContent:"center", 
                  justifySelf:"center", 
                  margin:"auto 12px", 
                  marginTop:"8px" 
                  }}>
                    Turma
             </text>
            </div>
        </div>
            <div 
            style={{           
                fontSize: '18px',
                cursor: 'pointer',
                display:"flex",
                flexDirection:"row",
                width: '250px',
                // marginLeft: '60px',
            }}>
           <div>
              <svg width="35" height="40"  viewBox="0 0 57 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_4_123)">
                <path d="M23.7262 5C10.6162 5 0 15.4533 0 28.3333C0 41.2133 10.6162 51.6667 23.7262 51.6667C36.86 51.6667 47.5 41.2133 47.5 28.3333C47.5 15.4533 36.86 5 23.7262 5ZM40.185 19H33.1787C32.4188 16.0833 31.3263 13.2833 29.9013 10.6933C34.2713 12.1633 37.905 15.15 40.185 19ZM23.75 9.76C25.7213 12.56 27.265 15.6633 28.2862 19H19.2138C20.235 15.6633 21.7787 12.56 23.75 9.76ZM5.3675 33C4.9875 31.5067 4.75 29.9433 4.75 28.3333C4.75 26.7233 4.9875 25.16 5.3675 23.6667H13.395C13.205 25.2067 13.0625 26.7467 13.0625 28.3333C13.0625 29.92 13.205 31.46 13.395 33H5.3675ZM7.315 37.6667H14.3212C15.0812 40.5833 16.1737 43.3833 17.5987 45.9733C13.2287 44.5033 9.595 41.54 7.315 37.6667ZM14.3212 19H7.315C9.595 15.1267 13.2287 12.1633 17.5987 10.6933C16.1737 13.2833 15.0812 16.0833 14.3212 19ZM23.75 46.9067C21.7787 44.1067 20.235 41.0033 19.2138 37.6667H28.2862C27.265 41.0033 25.7213 44.1067 23.75 46.9067ZM29.3075 33H18.1925C17.9788 31.46 17.8125 29.92 17.8125 28.3333C17.8125 26.7467 17.9788 25.1833 18.1925 23.6667H29.3075C29.5212 25.1833 29.6875 26.7467 29.6875 28.3333C29.6875 29.92 29.5212 31.46 29.3075 33ZM29.9013 45.9733C31.3263 43.3833 32.4188 40.5833 33.1787 37.6667H40.185C37.905 41.5167 34.2713 44.5033 29.9013 45.9733ZM34.105 33C34.295 31.46 34.4375 29.92 34.4375 28.3333C34.4375 26.7467 34.295 25.2067 34.105 23.6667H42.1325C42.5125 25.16 42.75 26.7233 42.75 28.3333C42.75 29.9433 42.5125 31.5067 42.1325 33H34.105Z" fill="white"/>
                </g>
                <defs>
                <clipPath id="clip0_4_123">
                <rect width="57" height="56" fill="white"/>
                </clipPath>
                </defs>
               </svg>
            </div>
           <text  style={{display:"flex", justifyContent:"center", justifySelf:"center", margin:"auto 12px", marginTop:"8px"}}>
            Rede
          </text>
        </div>
        <div
          style={{
            fontSize: "18px",
            margin: "12px 0",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            flexDirection: "row",
          }}
        >
            <div>
              <svg width="35" height="40"  viewBox="0 0 39 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M0.338867 24.4444H17.089V0H0.338867V24.4444ZM0.338867 44H17.089V29.3333H0.338867V44ZM21.2766 44H38.0268V19.5556H21.2766V44ZM21.2766 0V14.6667H38.0268V0H21.2766Z" fill="white"/>
               </svg>
            </div>
            <text style={{display:"flex", justifyContent:"center", justifySelf:"center", margin:"auto 10px", marginTop:"8px" }}>Conteúdo</text>
          </div>
      </nav>
    <div 
        style={{
        fontSize: '14px',
        cursor: 'pointer',
        display: "flex",
        alignItems: 'center',
        marginBottom: '-80px',
        }}>
        <button 
            onClick={() => {
            // Adicione aqui a lógica para ajuda
            console.log('Usuário solicitou ajuda');
            }}
            style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '4px',
            transition: 'background-color 0.3s',
            fontWeight: '500',
            fontSize: '14px',
            width: '100%',
            textAlign: 'left'
            }}
            onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            <svg width="25" height="30" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.8416 32H19.2662V28H15.8416V32ZM17.5539 0C8.10215 0 0.431152 8.96 0.431152 20C0.431152 31.04 8.10215 40 17.5539 40C27.0057 40 34.6767 31.04 34.6767 20C34.6767 8.96 27.0057 0 17.5539 0ZM17.5539 36C10.0028 36 3.8557 28.82 3.8557 20C3.8557 11.18 10.0028 4 17.5539 4C25.105 4 31.2521 11.18 31.2521 20C31.2521 28.82 25.105 36 17.5539 36ZM17.5539 8C13.7698 8 10.7048 11.58 10.7048 16H14.1294C14.1294 13.8 15.6704 12 17.5539 12C19.4374 12 20.9785 13.8 20.9785 16C20.9785 20 15.8416 19.5 15.8416 26H19.2662C19.2662 21.5 24.403 21 24.403 16C24.403 11.58 21.338 8 17.5539 8Z" fill="white"/>
            </svg>
            <span style={{ marginLeft: '10px' }}>Ajuda</span>
        </button>
        </div>

        <div style={{
        fontSize: '14px',
        cursor: 'pointer',
        display: "flex",
        alignItems: 'center',
        marginBottom: '-80px',
        }}>
        <button 
            onClick={() => {
            // Adicione aqui a lógica para configurações
            console.log('Usuário acessou configurações');
            }}
            style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '4px',
            transition: 'background-color 0.3s',
            fontWeight: '500',
            fontSize: '14px',
            width: '100%',
            textAlign: 'left'
            }}
            onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            <svg width="25" height="30" viewBox="0 0 35 39" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M33.6766 22.0227V16.9773L28.8559 16.2322C28.5724 14.9502 28.1222 13.7231 27.5201 12.5911L30.4648 8.20155L27.3212 4.63441L23.4474 7.97114C22.4484 7.28889 21.3655 6.77877 20.2341 6.4575L19.5766 1H15.124L14.4664 6.46255C13.335 6.78382 12.2521 7.29394 11.2531 7.97618L7.37933 4.63441L4.23131 8.20155L7.17599 12.5911C6.57391 13.7231 6.12372 14.9502 5.8402 16.2322L1.02393 16.9773V22.0227L5.84465 22.7678C6.12817 24.0498 6.57836 25.2769 7.18044 26.4089L4.23576 30.7985L7.38378 34.3656L11.2576 31.0289C12.2565 31.7111 13.3395 32.2212 14.4709 32.5425L15.124 38H19.5766L20.2341 32.5375C21.3655 32.2162 22.4484 31.7061 23.4474 31.0238L27.3212 34.3605L30.4692 30.7934L27.5246 26.4039C28.1266 25.2719 28.5768 24.0448 28.8603 22.7627L33.6766 22.0227Z" stroke="white" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="square"/>
            <path d="M17.3502 24.5454C19.8093 24.5454 21.8029 22.2865 21.8029 19.5C21.8029 16.7135 19.8093 14.4545 17.3502 14.4545C14.8911 14.4545 12.8976 16.7135 12.8976 19.5C12.8976 22.2865 14.8911 24.5454 17.3502 24.5454Z" stroke="white" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="square"/>
            </svg>
            <span style={{ marginLeft: '10px' }}>Configurações</span>
        </button>
        </div>

        <div style={{
        fontSize: '14px',
        // cursor: 'pointer',
        display: "flex",
        alignItems: 'center',
        // marginBottom: '10px',
        }}>
        <button 
          onClick={() => {
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
          }}
            style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '4px',
            transition: 'background-color 0.3s',
            fontWeight: '500',
            fontSize: '14px',
            width: '100%',
            textAlign: 'left'
            }}
            onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            <svg width="25" height="30" viewBox="0 0 31 39" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.2964 8.66667L21.1628 11.7217L25.0668 17.3333H9.6778V21.6667H25.0668L21.1628 27.2567L23.2964 30.3333L30.8622 19.5L23.2964 8.66667ZM3.6251 4.33333H15.7305V0H3.6251C1.96061 0 0.598755 1.95 0.598755 4.33333V34.6667C0.598755 37.05 1.96061 39 3.6251 39H15.7305V34.6667H3.6251V4.33333Z" fill="white"/>
            </svg>
            <span style={{ marginLeft: '10px' }}>Sair</span>
        </button>
        </div>
      </div>
    );
 }
