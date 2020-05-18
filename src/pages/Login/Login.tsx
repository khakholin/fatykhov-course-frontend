import React, { useState, Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router-dom';
import Button from '@material-ui/core/Button';

import BGContent from '../../components/common/BGContent/BGContent';
import InputField from '../../components/common/InputField/InputField';
import ModalComponent from '../../components/common/ModalComponent/ModalComponent';
import { REPLACEABLE_FIELD_NAME, emailRegExp } from '../../constants/common';
import { endpoints } from '../../constants/endpoints';
import * as translation from '../../constants/translation';
import appHistory from '../../modules/app/appHistory';
import { appRequest } from '../../modules/app/appRequest';
import { setCookie } from '../../utils/operationsWithCookie';
import { IResponse } from '../../types/responseTypes';

import './loginStyle.scss';
import { EResponseMessages } from '../../constants/responseMessages';

type TLogin = RouteComponentProps;

const Login = (props: TLogin) => {
    const [confirmPassword, setConfirmPassword] = useState({ value: '', show: false });
    const [confirmPasswordError, setConfirmPasswordError] = useState({ showCheck: false, status: false, text: '' });
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState({ showCheck: false, status: false, text: '' });
    const [forgotPassword, setForgotPassword] = useState(false);
    const [login, setLogin] = useState('');
    const [loginError, setLoginError] = useState({ showCheck: false, status: false, text: '' });
    const [modalText, setModalText] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [password, setPassword] = useState({ value: '', show: false });
    const [passwordError, setPasswordError] = useState({ showCheck: false, status: false, text: '' });
    const [registration, setRegistration] = useState(false);

    const clearData = () => {
        setConfirmPassword({ value: '', show: false });
        setConfirmPasswordError({ showCheck: false, status: false, text: '' });
        setEmail('');
        setEmailError({ showCheck: false, status: false, text: '' });
        setLogin('');
        setLoginError({ showCheck: false, status: false, text: '' });
        setPassword({ value: '', show: false });
        setPasswordError({ showCheck: false, status: false, text: '' });
    }


    const confirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setConfirmPassword({ ...confirmPassword, value: event.target.value });
        password.value ? (
            event.target.value === password.value ?
                setConfirmPasswordError({ showCheck: true, status: false, text: '' }) :
                setConfirmPasswordError({ showCheck: false, status: true, text: translation.defaultTranslation.passwordMismatch })
        ) : setConfirmPasswordError({ showCheck: false, status: false, text: '' })
    };

    const confirmPasswordShowClick = () => {
        setConfirmPassword({ ...confirmPassword, show: !confirmPassword.show });
        const el = document.getElementById('confirm-password-field') as HTMLInputElement;
        el.focus();
        el.selectionStart = confirmPassword.value.length;
    };

    const emailChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEmail(event.target.value);
        if (registration) {
            if (event.target.value.length) {
                if (emailRegExp.test(event.target.value)) {
                    setEmailError({ showCheck: true, status: false, text: '' });
                } else {
                    setEmailError({ showCheck: false, status: true, text: translation.defaultTranslation.emailRequirements });
                }
            } else {
                setEmailError({
                    showCheck: false, status: true, text: translation.defaultTranslation.requiredField
                        .replace(REPLACEABLE_FIELD_NAME, translation.defaultTranslation.email)
                });
            }
        } else {
            if (event.target.value.length) {
                setEmailError({ showCheck: true, status: false, text: '' });
            } else {
                setEmailError({
                    showCheck: false, status: true, text: translation.defaultTranslation.requiredField
                        .replace(REPLACEABLE_FIELD_NAME, translation.defaultTranslation.email)
                });
            }
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleOpenModal = (text: string, title: string) => {
        setModalText(text);
        setModalTitle(title);
        setOpenModal(true);
        setTimeout(() => {
            handleCloseModal();
        }, 2000)
    };

    const handleRecoveryPassword = () => {
        appRequest('/user/recovery', 'POST', { email })
            .then((response: IResponse) => {
                response.data ? handleOpenModal('Ваш пароль успешно выслан на почту', 'Внимание') :
                    handleOpenModal('Пользователь с таким почтовым ящиком не зарегистрирован', 'Ошибка');
            })
        clearData();
    }

    const handleRegistration = () => {
        appRequest('/user/registration', 'POST', { email, login, password: password.value })
            .then((response: IResponse) => {
                if (response.data.status === 201) {
                    handleOpenModal('Вы успешно зарегистрированы', 'Внимание');
                } else {
                    if (response.data.message === 'EMAIL_DUPLICATE') {
                        handleOpenModal('Нельзя зарегистрировать несколько пользователей с одним почтовым ящиком', 'Ошибка')

                    }
                    if (response.data.message === 'USER_DUPLICATE') {
                        handleOpenModal('Пользователь с таким именем уже существует', 'Ошибка')

                    }
                }
            })
        clearData();
    }

    const loginChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setLogin(event.target.value);
        if (registration) {
            event.target.value.length ? (
                event.target.value.length < 5 ?
                    setLoginError({ showCheck: false, status: true, text: translation.defaultTranslation.minimumLoginLength }) :
                    setLoginError({ showCheck: true, status: false, text: '' })
            ) : setLoginError({
                showCheck: false, status: true, text: translation.defaultTranslation.requiredField
                    .replace(REPLACEABLE_FIELD_NAME, translation.defaultTranslation.login)
            })
        } else {
            event.target.value.length ? (
                setLoginError({ showCheck: true, status: false, text: '' })
            ) : setLoginError({
                showCheck: false, status: true, text: translation.defaultTranslation.requiredField
                    .replace(REPLACEABLE_FIELD_NAME, translation.defaultTranslation.login)
            })
        }
    };

    const onEnterClickHandler = () => {
        appRequest(endpoints.authLogin, 'POST', { username: login, password: password.value })
            .then((response: IResponse) => {
                const authCookie = response.data?.access_token;
                setCookie('auth', authCookie ? authCookie : '', {}, 300);
                if (response.data.message === EResponseMessages.Unauthorized) {
                    handleOpenModal('Неверный пользователь или пароль', 'Ошибка');
                } else {
                    appHistory.push('/personal-area');
                }
            });
    };

    const passwordComparison = (realPassword: string) => {
        realPassword ? (
            confirmPassword.value === realPassword ?
                setConfirmPasswordError({ showCheck: true, status: false, text: '' }) :
                setConfirmPasswordError({ showCheck: false, status: true, text: translation.defaultTranslation.passwordMismatch })
        ) : setConfirmPasswordError({ showCheck: false, status: false, text: '' })
    };

    const passwordChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPassword({ ...password, value: event.target.value });
        if (registration) {
            if (event.target.value.length) {
                passwordComparison(event.target.value);
                for (let i = 0; i < event.target.value.length; i++) {
                    if (event.target.value[i] === ' ') {
                        setPasswordError({ showCheck: false, status: true, text: translation.defaultTranslation.passwordRequirements });
                        return
                    }
                }
                if (event.target.value.length < 5) {
                    setPasswordError({ showCheck: false, status: true, text: translation.defaultTranslation.simplePassword });
                } else {
                    setPasswordError({ showCheck: true, status: false, text: '' });
                }
            } else {
                setPasswordError({
                    showCheck: false, status: true, text: translation.defaultTranslation.requiredField
                        .replace(REPLACEABLE_FIELD_NAME, translation.defaultTranslation.password)
                });
            }
        } else {
            if (event.target.value.length) {
                setPasswordError({ showCheck: true, status: false, text: '' });
            } else {
                setPasswordError({
                    showCheck: false, status: true, text: translation.defaultTranslation.requiredField
                        .replace(REPLACEABLE_FIELD_NAME, translation.defaultTranslation.password)
                });
            }
        }
    };

    const passwordShowClick = () => {
        setPassword({ ...password, show: !password.show });
        const el = document.getElementById('password-field') as HTMLInputElement;
        el.focus()
        el.selectionStart = password.value.length;
    };

    return (
        <div className="login page-container">
            <div style={{ fontWeight: 700, border: '1px solid black' }} onClick={() => {

                appRequest('/user/testcreate', 'POST', { email: 'test1@mail.ru', login: 'Test1', password: 'Pass1' })
                    .then((resp) => {
                        console.log(resp);

                    });

            }}>CREAT1</div>
            <div style={{ fontWeight: 700, border: '1px solid black' }} onClick={() => {

                appRequest('/user/testcreate', 'POST', { email: 'test2@mail.ru', login: 'Test2', password: 'Pass2' })
                    .then((resp) => {
                        console.log(resp);

                    });

            }}>CREAT3</div>
            <div style={{ fontWeight: 700, border: '1px solid black' }} onClick={() => {

                appRequest('/user/testcreate', 'POST', { email: 'test3@mail.ru', login: 'Test3', password: 'Pass3' })
                    .then((resp) => {
                        console.log(resp);

                    });

            }}>CREAT3</div>
            <div style={{ fontWeight: 700, border: '1px solid black' }} onClick={() => {

                appRequest('/user/testremove', 'POST', { email: 'test1@mail.ru', login: 'Test1', password: 'Pass1' })
                    .then((resp) => {
                        console.log(resp);

                    });

            }}>REM1</div>
            <div style={{ fontWeight: 700, border: '1px solid black' }} onClick={() => {

                appRequest('/user/testremove', 'POST', { email: 'test2@mail.ru', login: 'Test2', password: 'Pass2' })
                    .then((resp) => {
                        console.log(resp);

                    });

            }}>REM2</div>
            <div style={{ fontWeight: 700, border: '1px solid black' }} onClick={() => {

                appRequest('/user/testremove', 'POST', { email: 'test3@mail.ru', login: 'Test3', password: 'Pass3' })
                    .then((resp) => {
                        console.log(resp);

                    });

            }}>REM3</div>
            <div style={{ fontWeight: 700, border: '1px solid black' }} onClick={() => {

                appRequest('/user/testfindall', 'GET')
                    .then((resp) => {
                        console.log(resp);

                    });
            }}>FINDALL</div>
            <div style={{ fontWeight: 700, border: '1px solid black' }} onClick={() => {

                appRequest('/user/testremoveall', 'GET')
                    .then((resp) => {
                        console.log(resp);

                    });
            }}>REMOVEALL</div>
            {registration ?
                <BGContent
                    title={translation.defaultTranslation.registrationTitle}
                >
                    <InputField
                        error={emailError}
                        field={{
                            name: 'email',
                            title: translation.defaultTranslation.email,
                            placeholder: translation.defaultTranslation.emailPlaceholder,
                        }}
                        handleChange={emailChange}
                        value={email}
                    />
                    <InputField
                        error={loginError}
                        field={{
                            name: 'login',
                            title: translation.defaultTranslation.login,
                            placeholder: translation.defaultTranslation.loginPlaceholder,
                        }}
                        handleChange={loginChange}
                        value={login}
                    />
                    <InputField
                        error={passwordError}
                        field={{
                            name: 'password',
                            title: translation.defaultTranslation.password,
                            placeholder: translation.defaultTranslation.passwordPlaceholder,
                        }}
                        handleChange={passwordChange}
                        passwordShowClick={passwordShowClick}
                        value={password}
                    />
                    <InputField
                        error={confirmPasswordError}
                        field={{
                            name: 'confirm-password',
                            title: translation.defaultTranslation.passwordAgain,
                            placeholder: translation.defaultTranslation.passwordPlaceholder,
                        }}
                        handleChange={confirmPasswordChange}
                        passwordShowClick={confirmPasswordShowClick}
                        value={confirmPassword}
                    />
                    <div className="buttons-container_column">
                        {
                            emailError.showCheck && loginError.showCheck && passwordError.showCheck && confirmPasswordError.showCheck ?
                                <Button
                                    className="button-primary button-primary_full-width button_column-margin"
                                    variant="outlined"
                                    onClick={() => handleRegistration()}
                                >
                                    {translation.defaultTranslation.registrationText}
                                </Button> :
                                <Button
                                    className="button_column-margin"
                                    disabled
                                    variant="outlined"
                                >
                                    {translation.defaultTranslation.registrationText}
                                </Button>
                        }
                        <Button
                            className="button-secondary button-secondary_full-width"
                            variant="outlined"
                            onClick={() => {
                                clearData();
                                setRegistration(false);
                            }}
                        >
                            {translation.defaultTranslation.haveAccountText}
                        </Button>
                    </div>
                </BGContent>
                : forgotPassword ?
                    <BGContent
                        title={translation.defaultTranslation.passwordRecovery}
                    >
                        <InputField
                            error={emailError}
                            field={{
                                name: 'email',
                                title: translation.defaultTranslation.email,
                                placeholder: translation.defaultTranslation.emailPlaceholder,
                            }}
                            handleChange={emailChange}
                            value={email}
                        />
                        <div className="buttons-container_column">
                            {
                                emailError.showCheck ?
                                    <Button
                                        className="button-primary button-primary_full-width button_column-margin"
                                        variant="outlined"
                                        onClick={() => handleRecoveryPassword()}
                                    >
                                        {translation.defaultTranslation.sendPasswordToEmail}
                                    </Button> :
                                    <Button
                                        className="button_column-margin"
                                        disabled
                                        variant="outlined"
                                    >
                                        {translation.defaultTranslation.sendPasswordToEmail}
                                    </Button>
                            }
                            <Button
                                className="button-secondary button-secondary_full-width"
                                variant="outlined"
                                onClick={() => {
                                    clearData();
                                    setForgotPassword(false);
                                }}
                            >
                                {translation.defaultTranslation.rememberPassword}
                            </Button>
                        </div>
                    </BGContent>
                    : (
                        <Fragment>
                            <BGContent
                                title={translation.defaultTranslation.enterTitle}
                            >
                                <InputField
                                    error={loginError}
                                    field={{
                                        name: 'login',
                                        title: translation.defaultTranslation.login,
                                        placeholder: translation.defaultTranslation.loginPlaceholder,
                                    }}
                                    handleChange={loginChange}
                                    value={login}
                                />
                                <InputField
                                    error={passwordError}
                                    field={{
                                        name: 'password',
                                        title: translation.defaultTranslation.password,
                                        placeholder: translation.defaultTranslation.passwordPlaceholder,
                                    }}
                                    handleChange={passwordChange}
                                    passwordShowClick={passwordShowClick}
                                    value={password}
                                />
                                <div className="buttons-container_row">
                                    {
                                        loginError.showCheck && passwordError.showCheck ?
                                            <Button
                                                className="button-primary"
                                                variant="outlined"
                                                onClick={() => onEnterClickHandler()}
                                            >
                                                {translation.defaultTranslation.enterText}
                                            </Button>
                                            :
                                            <Button
                                                disabled
                                                variant="outlined"
                                            >
                                                {translation.defaultTranslation.enterText}
                                            </Button>
                                    }
                                    <div
                                        className="button-text"
                                        onClick={() => {
                                            clearData();
                                            setForgotPassword(true);
                                        }}
                                    >
                                        {translation.defaultTranslation.forgotPassword}
                                    </div>
                                </div>
                            </BGContent>
                            <div className="login-registration">
                                <BGContent
                                    title={translation.defaultTranslation.firstTimeWithUs}
                                >
                                    <div className="buttons-container_row">
                                        <Button
                                            className="button-secondary button-secondary_full-width"
                                            onClick={() => {
                                                clearData();
                                                setRegistration(true);
                                            }}
                                            variant="outlined"
                                        >
                                            {translation.defaultTranslation.registrationText}
                                        </Button>
                                    </div>
                                </BGContent>
                            </div>
                        </Fragment>
                    )
            }
            <ModalComponent
                closeHandler={handleCloseModal}
                error
                isOpen={openModal}
                text={modalText}
                title={modalTitle}
            />
        </div>
    );
};

export default (withRouter(Login));
