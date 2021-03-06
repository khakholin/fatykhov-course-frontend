import React, { useState, useEffect, Fragment } from 'react';
import { Button, CircularProgress } from '@material-ui/core';

import InputField from '../../../../components/common/InputField/InputField';
import { textRusRealNameRegExp, } from '../../../../constants/common';
import { useLocalStorage } from '../../../../hooks/useLocalStorage';
import { appRequest } from '../../../../modules/app/appRequest';
import { IUserProfileResponse } from '../../../../types/responseTypes';

import './myProfileStyle.scss';
import ModalComponent from '../../../../components/common/ModalComponent/ModalComponent';

export interface IMyProfileProps { }

const MyProfile = (props: IMyProfileProps) => {
    // eslint-disable-next-line
    const [initialEmail, setInitialEmail] = useLocalStorage('initialEmail', '');
    const [isLoader, setIsLoader] = useState(true);
    useEffect(() => {
        setTimeout(() => setIsLoader(false), 500);
        appRequest('/api/user/data', 'POST', { email: initialEmail })
            .then((response: { data: IUserProfileResponse }) => {
                setRealName(response.data.realName);
                setRealNameError({ ...realNameError, showCheck: (response.data.realName ? true : false), status: false });
                setRealSurname(response.data.realSurname);
                setRealSurnameError({ ...realSurnameError, showCheck: (response.data.realSurname ? true : false), status: false });
                setSchool(response.data.school);
                setSchoolError({ ...schoolError, showCheck: (response.data.school ? true : false), status: false });
                setUniversity(response.data.university);
                setUniversityError({ ...universityError, showCheck: (response.data.university ? true : false), status: false });
                setUserNameError({ ...userNameError, showCheck: (response.data.username ? true : false), status: false });
                setWorkPlace(response.data.workPlace);
                setWorkPlaceError({ ...workPlaceError, showCheck: (response.data.workPlace ? true : false), status: false });
            });
        // eslint-disable-next-line
    }, []);
    const [realName, setRealName] = useState('');
    const [realNameError, setRealNameError] = useState({ showCheck: false, status: false, text: '' });
    const [realSurname, setRealSurname] = useState('');
    const [realSurnameError, setRealSurnameError] = useState({ showCheck: false, status: false, text: '' });
    const [school, setSchool] = useState('');
    const [schoolError, setSchoolError] = useState({ showCheck: false, status: false, text: '' });
    const [university, setUniversity] = useState('');
    const [universityError, setUniversityError] = useState({ showCheck: false, status: false, text: '' });
    const [userNameError, setUserNameError] = useState({ showCheck: false, status: false, text: '' });
    const [workPlace, setWorkPlace] = useState('');
    const [workPlaceError, setWorkPlaceError] = useState({ showCheck: false, status: false, text: '' });
    const [openModal, setOpenModal] = useState(false);

    const realNameChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRealName(event.target.value.trim());

        if (event.target.value.trim().length) {
            for (let i = 0; i < event.target.value.trim().length; i++) {
                if (event.target.value[i] === ' ') {
                    setRealNameError({ showCheck: false, status: true, text: 'Имя может состоять из букв криллицы и не должно содержать пробелы' });
                    return
                }
            }
            if (!textRusRealNameRegExp.test(event.target.value)) {
                setRealNameError({ showCheck: false, status: true, text: 'Имя может состоять из букв криллицы и не должно содержать пробелы' });
            } else {
                if (event.target.value.trim().length < 1) {
                    setRealNameError({ showCheck: false, status: true, text: 'Минимальная длина имени - 1 символ' })
                } else {
                    setRealNameError({ showCheck: true, status: false, text: '' })
                }
            }
        } else {
            setRealNameError({
                showCheck: false, status: true, text: 'Имя обязательно для заполнения'
            })
        }
    };

    const realSurnameChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRealSurname(event.target.value.trim());

        if (event.target.value.trim().length) {
            for (let i = 0; i < event.target.value.trim().length; i++) {
                if (event.target.value[i] === ' ') {
                    setRealSurnameError({ showCheck: false, status: true, text: 'Фамилия может состоять из букв криллицы, знака тире и не должна содержать пробелы' });
                    return
                }
            }
            if (!textRusRealNameRegExp.test(event.target.value)) {
                setRealSurnameError({ showCheck: false, status: true, text: 'Логин должен состоять из букв латинского алфавита и не должна содержать пробелы' });
            } else {
                if (event.target.value.trim().length < 1) {
                    setRealSurnameError({ showCheck: false, status: true, text: 'Минимальная длина фамилии - 1 символ' })
                } else {
                    setRealSurnameError({ showCheck: true, status: false, text: '' })
                }
            }
        } else {
            setRealSurnameError({
                showCheck: false, status: true, text: 'Фамилия обязательна для заполнения'
            })
        }
    };

    const schoolChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSchool(event.target.value);
        if (event.target.value.length) {
            setSchoolError({ showCheck: true, status: false, text: '' });
        } else {
            setSchoolError({ showCheck: false, status: false, text: '' });
        }
    };

    const universityChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setUniversity(event.target.value);
        if (event.target.value.length) {
            setUniversityError({ showCheck: true, status: false, text: '' });
        } else {
            setUniversityError({ showCheck: false, status: false, text: '' });
        }
    };

    const workPlaceChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setWorkPlace(event.target.value);
        if (event.target.value.length) {
            setWorkPlaceError({ showCheck: true, status: false, text: '' });
        } else {
            setWorkPlaceError({ showCheck: false, status: false, text: '' });
        }
    };

    const onSaveClick = () => {
        setOpenModal(true);
        setTimeout(() => {
            handleCloseModal();
        }, 4000);
        appRequest('/api/user/data-update', 'POST', { email: initialEmail, realName, realSurname, school, university, workPlace })
            .then(() => { });
    }

    const handleCloseModal = () => {
        setOpenModal(false);
    };


    return (
        <Fragment>
            <div className="personal-account-info-header">
                <div className="personal-account-info-header__title">Профиль</div>
                <div className="personal-account-info-header__description">Добавьте информацию о себе</div>
            </div>
            <div className="my-profile-component personal-account-info-body">
                {
                    isLoader ?
                        <div className="info-form-spinner__wrapper">
                            <CircularProgress
                                className="info-form-spinner__item"
                                size={100}
                                thickness={3}
                            />
                        </div>
                        :
                        <div className="my-profile-component__form">
                            <InputField
                                error={realNameError}
                                field={{
                                    name: 'realName',
                                    title: 'Имя',
                                    placeholder: 'Евкакий',
                                }}
                                handleChange={realNameChange}
                                value={realName}
                            />
                            <InputField
                                error={realSurnameError}
                                field={{
                                    name: 'realSurname',
                                    title: 'Фамилия',
                                    placeholder: 'Премудрый',
                                }}
                                handleChange={realSurnameChange}
                                value={realSurname}
                            />
                            <InputField
                                error={schoolError}
                                field={{
                                    name: 'school',
                                    title: 'Школа',
                                    placeholder: 'Гимназия №4',
                                }}
                                handleChange={schoolChange}
                                value={school}
                            />
                            <InputField
                                error={universityError}
                                field={{
                                    name: 'university',
                                    title: 'Университет',
                                    placeholder: 'Стэнфорд',
                                }}
                                handleChange={universityChange}
                                value={university}
                            />
                            <InputField
                                error={workPlaceError}
                                field={{
                                    name: 'workPlace',
                                    title: 'Место работы',
                                    placeholder: 'Facebook',
                                }}
                                handleChange={workPlaceChange}
                                value={workPlace}
                            />
                            {
                                (realName && !realNameError.status && realSurname && !realSurnameError.status) ?
                                    <Button
                                        className="button-primary button-primary_full-width"
                                        variant="outlined"
                                        onClick={() => onSaveClick()}
                                    >
                                        Сохранить
                                    </Button>
                                    :
                                    <Button
                                        disabled
                                        variant="outlined"
                                        className="button-secondary_full-width"
                                    >
                                        Сохранить
                                    </Button>
                            }
                            <ModalComponent
                                closeHandler={handleCloseModal}
                                error
                                isOpen={openModal}
                                text={'Информация о вас успешно обновлена'}
                                title={'Внимание'}
                            />
                        </div>
                }
            </div>
        </Fragment>
    );
};

export default MyProfile;
