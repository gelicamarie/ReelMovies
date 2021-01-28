import * as Yup from 'yup';
import { useFormik } from 'formik';
import gel from 'clsx';
import useSwr from 'swr';
import { useParams } from '@reach/router';
import Layout from '../../components/Layout';
import FormSubmitBtn from '../../components/SubmitBtn';

const addFormOption = [
  { id: 'title', type: 'text', placeholder: 'Title' },
  { id: 'genre', type: 'text', placeholder: 'Genre' },
  { id: 'plot', type: 'text', placeholder: 'Plot' },
  { id: 'releaseDate', type: 'text', placeholder: 'Release Date' },
  { id: 'directors', type: 'text', placeholder: 'Directors' },
  { id: 'actors', type: 'text', placeholder: 'Actors' },
  { id: 'writers', type: 'text', placeholder: 'Writers' },
];

const ConvertArrayToString = (list) => list.map((a) => a.name);

const Edit = () => {
  const { movieId } = useParams();
  const { data } = useSwr(`/movies/${movieId}`);

  const formik = useFormik({
    initialValues: {
      title: data ? data.title : '',
      genre: data ? data.genre : '',
      plot: data ? data.plot : '',
      releaseDate: data ? data.releaseDate : '',
      directors: data ? ConvertArrayToString(data.directors) : '',
      writers: data ? ConvertArrayToString(data.writers) : '',
      actors: data ? ConvertArrayToString(data.actors) : '',
    },
    validationSchema: Yup.object().shape({
      title: Yup.string()
        .max(100, 'First name must be less than 100 characters')
        .required('Title is required'),
      genre: Yup.string()
        .required('Genre is required'),
      releaseDate: Yup.string()
        .required('Release Date is required'),
      directors: Yup.string()
        .required('Director is required'),
      writers: Yup.string()
        .required('Writers is required'),
      actors: Yup.string()
        .required('Actors is required'),
    }),

    onSubmit: async (values) => {
      const response = await fetch(`/movies/${movieId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          genre: values.genre,
          plot: values.plot,
          releaseDate: values.releaseDate,
          directors: values.directors,
          writers: values.writers,
          actors: values.actors,
        }),
      });

      if (response.status === 200) {
        const res = await response.json();
        // eslint-disable-next-line no-underscore-dangle
        window.location.assign(`/movies/${res._id}`);
      } else {
        const { message } = await response.json();
        alert(`${message}`);
      }
    },
  });

  return (
    <Layout>
      <div className="py-4 pb-8 bg-theme-gelsBlue overflow-hidden sm:rounded-lg font-sans text-theme-bodyBg">
        <div className="flex items-baseline">
          <div className="border-2-b border-theme-gelsBlue sm:px-4 text-3xl font-bold text-theme-orange">Edit Movie</div>
          <h1 className="pr-2 pl-2">(editing movie)</h1>
        </div>
        <div className="flex flex-col p-8 border-t-8 border-theme-bodyBg">
          <form onSubmit={formik.handleSubmit}>
            {addFormOption.map(({ id, type, placeholder }) => (
              <label htmlFor={id} key={id}>

                <span>{placeholder}</span>

                <div
                  className="flex px-10"
                  style={{ verticalAlign: 'middle' }}
                >

                  <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    {...formik.getFieldProps(id)}
                    className={gel(
                      'form-input my-2 block w-full rounded-lg text-black',
                      { 'border-theme-orange border-2': formik.errors[id] },
                    )}
                  />

                  {formik.touched[id] && formik.errors[id] ? (
                    <div className="w-6 text-theme-orange my-auto" style={{ marginLeft: '-35px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  ) : null}

                </div>

                {formik.touched[id] && formik.errors[id] ? (
                  <div>
                    <p className="text-red-600 text-xs italic">{formik.errors[id]}</p>
                  </div>
                ) : null}

              </label>
            ))}
            <div className="float items-left">
              <FormSubmitBtn label="Update Movie" />
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Edit;
