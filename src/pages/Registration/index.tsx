import {useState} from 'react';
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import './style.css'
import {useNavigate} from "react-router-dom"
import { useForm } from "react-hook-form";
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup";
import {useTranslation} from "react-i18next";
import i18n from "../../locales/i18n";
import axios from "axios";

const BASE_URL: string = import.meta.env.VITE_BASE_URL as string;

export const schema = yup.object({
    name: yup.string().required().min(5).max(100),
    email: yup.string().required().email().max(350),
    password: yup.string().required().min(8).max(64)
        .matches(/\d+/, i18n.t('registration.form.validation.password.number'))
        .matches(/[a-z]+/, i18n.t('registration.form.validation.password.lowercase'))
        .matches(/[A-Z]+/, i18n.t('registration.form.validation.password.uppercase'))
        .matches(/[\W_]+/, i18n.t('registration.form.validation.password.special')),
    terms: yup.boolean().oneOf([true], i18n.t('registration.form.validation.termsCheckbox'))
}).required()

function Registration() {
    const {t} = useTranslation()
    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema)})
    const navigate = useNavigate()
    const [isChecked, setIsChecked] = useState(false);

    const onSubmit = (data: CreateUserResponse) => {
            void createUser(data)
    }

    async function createUser(data: CreateUserResponse) {
        try {
            await axios.post<CreateUserResponse>(
                BASE_URL + '/users',
                { name: data.name, email: data.email.toLowerCase(), password: data.password },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                },
            );
            navigate('/resend-email', { state: { data: data.email }})
        }
        catch(error) {
            if (axios.isAxiosError(error)) {
                handleError(error)
            } else {
                console.log('unexpected error: ', error);
                return 'An unexpected error ocurred';
            }
        }
    }
    
    const handleLogin = () => {
        return navigate("/login")
    }

    const handleError = (error) => {
        let responseStatus: number
        let problemDetail: ProblemDetail
        responseStatus = error.response.data.status
        if (responseStatus == 400) {
            alert(i18n.t("registration.exception.badRequest"))
        } else if (responseStatus == 409) {
            problemDetail = error.response.data;
            if (problemDetail.title == "User Already exists" && problemDetail.detail == "Email already exists")
                alert(i18n.t("registration.exception.email"))
        }
    }


    return (
        <>
            <div className="formContainer">
                <PageHeader title={t('registration.title')} text={t('registration.text')}/>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="formInput">
                        <label id="name" htmlFor={"name"}>{t('registration.form.name')}</label>
                        <input aria-labelledby="name" type="text" {...register("name", { required: true })} />
                        <p>{errors.name?.message}</p>
                    </div>
                    <div className="formInput">
                        <label id="email" htmlFor={"email"}>{t('registration.form.email')}</label>
                        <input aria-labelledby="email" type="text" {...register("email", { required: true })} />
                        <p>{errors.email?.message}</p>
                    </div>
                    <div className="formInput">
                        <label id="password" htmlFor={"password"}>{t('registration.form.password')}</label>
                        <input aria-labelledby="password" type="password" {...register("password", { required: true })} />
                        <p>{errors.password?.message}</p>
                    </div>
                    <div className="checkbox">
                        <input aria-labelledby="terms" type="checkbox" checked={isChecked}
                                {...register("terms", { onChange:(e) => setIsChecked(e.target.checked) })} />
                        <label id="terms" htmlFor="terms">{t('registration.form.termsCheckbox')}</label>
                        <p>{errors.terms?.message}</p>
                    </div>
                    <div id="buttons">
                        <button data-testid="loginButton" onClick={handleLogin}>{t('registration.form.login')}</button>
                        <button data-testid="submitButton" type="submit">{t('registration.form.submit')}</button>
                    </div>
                </form>
                <PageFooter text={t('registration.footer')}/>
            </div>
        </>
    );
}

export default Registration;