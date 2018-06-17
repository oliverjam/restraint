import React from 'react';

const hasError = el => !el.validity.valid;

const getMessages = ({ name, type }) => ({
  valueMissing: `${name} is required`,
  badInput: 'Please enter a number',
  typeMismatch:
    type === 'email'
      ? 'Please enter an email address'
      : type === 'url'
        ? 'Please enter a URL'
        : 'Please enter the correct type',
  patternMismatch: 'Please match the requested format',
});

class Restraint extends React.Component {
  static defaultProps = {
    blacklist: ['file', 'submit', 'reset', 'button'],
    getMessages,
  };

  state = {
    errors: {
      name: null,
      email: null,
    },
    jsEnabled: false,
  };

  componentDidMount() {
    this.setState({ jsEnabled: true });
  }

  noValidate = ({ type, disabled }) =>
    this.props.blacklist.includes(type) || disabled;

  getErrors = ({ name, type, validity }) => {
    const messages = this.props.getMessages({ name, type });
    let errorKeys = [];
    for (const error in validity) {
      errorKeys.push(error);
    }
    const errors = errorKeys
      .reduce((acc, error) => {
        if (!validity[error]) return acc;
        return acc.concat(messages[error]);
      }, [])
      .filter(Boolean);
    return errors.length > 0 ? errors : null;
  };

  handleErrors = ({ errors, input }) =>
    this.props.handleErrors
      ? this.props.handleErrors({ errors, input })
      : this.setState(prevState => {
          return {
            errors: {
              ...prevState.errors,
              [input.name]: errors,
            },
          };
        });

  validate = input => {
    if (this.noValidate(input)) return;
    const errors = this.getErrors(input);
    this.handleErrors({ errors, input });
  };

  handleBlur = e => {
    this.validate(e.target);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { target } = e;
    if (!target.checkValidity()) {
      const elements = Array.from(target.elements);
      const firstInvalid = elements.find(hasError);
      firstInvalid.focus();
      elements.forEach(this.validate);
    }
  };

  getFormProps = () => ({
    onBlur: this.handleBlur,
    onSubmit: this.handleSubmit,
    noValidate: this.state.jsEnabled,
  });

  render() {
    const {
      state: { errors },
      getFormProps,
    } = this;
    return this.props.render({ errors, getFormProps });
  }
}

export default Restraint;
