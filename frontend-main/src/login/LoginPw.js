import { useEffect, useRef, useState, useContext } from 'react';
import LoginBtn from './component/button/LoginBtn';
import LoginHeader from './component/header/LoginHeader';
import { call } from './service/ApiService';
import { useNavigate } from 'react-router-dom';
import { CommonContext } from '../App';

function LoginPw(props) {
    const [pw,setPw] =useState("");
    const inputRef = useRef(null);
    const loginUserNo = localStorage.getItem("userNo");
    const [errorMessage, setErrorMessage] = useState("");
    const navi = useNavigate();
    const { setLoginUser } = useContext(CommonContext);
    const isButtonDisabled = pw.length < 6;

    useEffect(() => {
        inputRef.current.focus();
    }, []);


    const handleChange = (e) => {
        const value = e.target.value.slice(0, 6);
        setPw(value);
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // default 이벤트 취소
        const userSimplePassword = pw;

        call('/api/v1/auth/login/simple', "POST",
            { userNo: loginUserNo, userSimplePassword: userSimplePassword }
        ).then((response) => {
            console.log("간편 로그인 성공:", response);
            localStorage.setItem("ACCESS_TOKEN", response.accessToken);
            localStorage.setItem("loginUser", "USER"); // Always set to USER
            localStorage.setItem("userNo", response.userNo);

            // Context 상태 업데이트
            setLoginUser({
                userType: "USER",
                userNo: response.userNo
            });

            // 모든 사용자는 홈으로 리다이렉트
            navi("/home");

        }).catch((error) => {
            console.error("간편비밀번호로그인 실패", error);
            const localUserNo = localStorage.getItem("userNo");

            if(!localUserNo){
                setErrorMessage("아이디 로그인 1회 이용 이후 사용하실 수 있습니다.");
            }else{
                setErrorMessage("로그인에 실패했습니다. 다시 시도해주세요.");
            }
           
            setPw('');
            inputRef.current.focus();
        });
    };

    const handleCircleWrapClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };
    const circles = Array(6).fill(null); 
    return (
        <div>
            <LoginHeader/>
            <form onSubmit={handleSubmit}>
                <div className="login-container"> 
                    <div className='circle-wrap' onClick={handleCircleWrapClick}>          
                        {circles.map((_, index) => (
                            <div key={index}

                            className={`small-circle ${pw.length > index ? 'filled' : ''}`}>
                                
                            </div>
                        ))}
                    </div>               
                    <div className='error-message'>{errorMessage}</div>
                </div>
                <input
                    ref={inputRef}
                    type="tel"
                    value={pw}
                    onChange={handleChange}
                    className="hidden-input"
                    style={{ 
                        opacity: 0, 
                        position: 'absolute', 
                        zIndex: -1 
                    }}
                    name='userSimplePassword'
                    autoComplete="off" 
                />
                <LoginBtn isButtonDisabled={isButtonDisabled}/>
            </form>
        </div>
    );
}

export default LoginPw;