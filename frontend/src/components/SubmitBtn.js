import gel from 'clsx';
import { string } from 'prop-types';

const SubmitButton = ({ label }) => (
  <button
    type="submit"
    className={gel(
      'mt-2 w-25 px-6 py-1',
      'box-border font-semibold rounded-lg border-2 border-theme-orange',
      'bg-transparent hover:bg-theme-orange text-theme-orange hover:text-theme-gelsWhite',
    )}
  >
    {label}
  </button>
);

SubmitButton.propTypes = {
  label: string.isRequired,
};

export default SubmitButton;
