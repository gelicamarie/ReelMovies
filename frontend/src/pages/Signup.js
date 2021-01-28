import { useContext } from 'react';
import { useFormik } from 'formik';
import { Link } from '@reach/router';
import * as Yup from 'yup';
import gel from 'clsx';
import Layout from '../components/Layout';
import FormInput from '../components/FormInput';
import FormSubmitBtn from '../components/SubmitBtn';
import { AuthContext, AUTH_ACTIONS } from '../lib/auth';

const contactFormOptions = [
  { id: 'firstname', type: 'text', placeholder: 'First name' },
  { id: 'lastname', type: 'text', placeholder: 'Last name' },
  { id: 'email', type: 'text', placeholder: 'Email' },
  { id: 'username', type: 'text', placeholder: 'Username' },
  { id: 'password', type: 'password', placeholder: 'Password' },
];

const Signup = () => {
  const { dispatch } = useContext(AuthContext);

  const formik = useFormik({
    initialValues: {
      firstname: '',
      lastname: '',
      email: '',
      username: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      firstname: Yup.string()
        .min(1, 'Error: cannot be empty')
        .max(100, 'Error: characters exceed 100 limit')
        .required(' First name is required'),
      lastname: Yup.string()
        .min(1, 'Error: cannot be empty')
        .max(100, 'Error: characters exceed 100 limit')
        .required(' Last name is required'),
      email: Yup.string()
        .email('Must be a valid email address')
        .max(100, 'Email must be less than 100 characters')
        .required('Email is required'),
      username: Yup.string()
        .min(5, 'Username must have at least 5 characters')
        .max(100, 'Username must be less than 100 characters')
        .required('Username is required'),
      password: Yup.string()
        .min(10, 'Password must have at least 10 characters')
        .max(100, "Password can't be longer than 100 characters")
        .required('Password is required'),
    }),
    onSubmit: async (values) => {
      const response = await fetch('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: {
            first: values.firstname,
            last: values.lastname,
          },
          email: values.email,
          password: values.password,
          username: values.username,
        }),
      });

      // If all good sign in the user and take to profile page
      if (response.status === 200) {
        const { _id } = await response.json();
        dispatch({ type: AUTH_ACTIONS.login });
        window.location.assign(`/users/${_id}`);
      } else {
        const { message } = await response.json();
        alert(`Error signing up ${message}`);
      }
    },
  });

  return (
    <Layout>

      <div className="md:flex md:items-center md:flex-row pt-6">

        <form
          style={{ boxShadow: '2px 2px 15px 5px rgba(147,58,22,1)' }}
          className={gel(
            'font-medium text-xl',
            'sm:w-3/4 mt-5 p-4 mx-auto',
            'rounded-lg',
          )}
          onSubmit={formik.handleSubmit}
        >

          <img src="/homepage.png" alt="Logo" className="flex h-48 mx-auto" />

          {contactFormOptions.map((props) => (
            <FormInput id={props.id} formik={formik} {...props} />
          ))}

          <div className="flex items-center justify-between">
            <Link to="/login" className="pl-2 text-theme-orange hover:text-theme-gelsWhite">Login</Link>
            <FormSubmitBtn label="Create Account" />
          </div>

        </form>

      </div>

    </Layout>
  );
};

export default Signup;
