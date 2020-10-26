/**
 * Form for creating a new message
 * expects a handleSubmit method for submitting the form
 * uses formik
 **/
import * as React from "react";
import { Formik, Form, Field, FormikProps } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt, faCopy } from "@fortawesome/free-solid-svg-icons";
import { css } from "@emotion/core";
import styled from "@emotion/styled";
import AppContext from "../context";
import Title from "./Title";
import Button from "./Button";
import theme from "../theme";
import FormInput from "./FormInput";
import TextArea from "./TextArea";

interface CreateNoteFormValues {
  note: string;
  deleteAfter: string;
  secret?: string;
}

interface CreateNoteFormProps {
  handleSubmit: (values: CreateNoteFormValues) => Promise<void>;
}

function validateNotEmptyString(value: string) {
  let error: string;
  if (value === "") error = "Note is not supposed to be empty";

  return error;
}

const selectCss = css`
  width: 110px;
  padding: 0.3rem 0.3rem;
  -webkit-appearance: none;
  appearance: none;
  -moz-appearance: none;
  border: none;
  background: ${theme.colors.elevation.dp02}
    url("data:image/svg+xml;utf8,<svg viewBox='0 0 140 140' width='16' height='16' xmlns='http://www.w3.org/2000/svg'><g><path d='m121.3,34.6c-1.6-1.6-4.2-1.6-5.8,0l-51,51.1-51.1-51.1c-1.6-1.6-4.2-1.6-5.8,0-1.6,1.6-1.6,4.2 0,5.8l53.9,53.9c0.8,0.8 1.8,1.2 2.9,1.2 1,0 2.1-0.4 2.9-1.2l53.9-53.9c1.7-1.6 1.7-4.2 0.1-5.8z' fill='white'/></g></svg>")
    no-repeat;
  background-position: right 5px top 60%;
  color: white;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  background: ${theme.colors.elevation.dp01};
  padding: ${theme.spacing[6]};

  textarea,
  input {
    padding: ${theme.spacing[2]};
    border-width: 0px;
  }
  textarea {
  }
`;

/**
 * CreateNoteForm is handling form input as well as fetching of secret key
 * TODO check if it makes more sense to extract the effect in order to make this
 * component more simple
 */
function CreateNoteForm({ handleSubmit }: CreateNoteFormProps): JSX.Element {
  const [secret, setSecret] = React.useState("");
  const { backend } = React.useContext(AppContext);

  React.useEffect(() => {
    async function fetchRandomKey() {
      const resp = await fetch(`${backend}/random/key`);
      const key = await resp.text();
      setSecret(key);
    }

    // if initially there is no secret or user resets, grab a new key from backend
    if (secret.length === 0) {
      fetchRandomKey();
    }
  }, [setSecret, secret]);

  return (
    <div
      css={css`
        width: 100%;
        height: 100%;
        max-width: 800px;
        max-height: 1000px;
        margin: 0 30px;
      `}
    >
      <Formik
        initialValues={{ note: "", deleteAfter: "1h" }}
        onSubmit={async (values, actions) => {
          await handleSubmit({ ...values, secret });
          actions.setSubmitting(false);
        }}
      >
        {(props: FormikProps<CreateNoteFormValues>) => (
          <FormContainer>
            <Title>Create a new note</Title>
            <Form
              css={css`
                display: flex;
                flex-direction: column;
                height: 100%;
              `}
            >
              <Field name="note" validate={validateNotEmptyString}>
                {({ field }) => (
                  <FormInput
                    css={css`
                      flex-grow: 1;
                    `}
                  >
                    <label htmlFor="note">Note</label>
                    <TextArea
                      {...field}
                      id="note"
                      placeholder="Start writing your burning letter here."
                    />
                  </FormInput>
                )}
              </Field>
              <FormInput>
                <label htmlFor="secret">
                  Secret (generated on the server){" "}
                </label>
                <div
                  css={css`
                    display: flex;
                    justify-content: space-between;
                  `}
                >
                  <input
                    type="text"
                    placeholder="generating..."
                    value={secret}
                    readOnly
                    css={(theme) => `
                      flex-grow: 1;
                      margin-right: 1rem;
                      color: ${theme.colors.onBackground};
                      background: ${theme.colors.elevation.dp02};

                    `}
                  />

                  <div
                    css={css`
                      display: flex;
                      align-items: center;
                    `}
                  >
                    <Button
                      css={css`
                        height: 100%;
                        margin-right: 0.5em;
                      `}
                      onClick={() => navigator.clipboard.writeText(secret)}
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </Button>
                    <Button
                      css={css`
                        height: 100%;
                      `}
                      onClick={() => setSecret("")}
                    >
                      <FontAwesomeIcon icon={faSyncAlt} />
                    </Button>
                  </div>
                </div>
              </FormInput>
              <Field name="deleteAfter">
                {({ field }) => (
                  <FormInput
                    css={() => `
                      display: flex;
                      flex-direction: column;
                    `}
                  >
                    <label htmlFor="deleteAfter"> Expires after </label>
                    <select css={selectCss} {...field}>
                      <option value="1h">1 hour</option>
                      <option value="3h">3 hours</option>
                      <option value="24h">1 day</option>

                      <option value="72h">3 days</option>
                    </select>
                  </FormInput>
                )}
              </Field>
              <div
                css={css`
                  display: flex;
                  flex-direction: row-reverse;
                  width: 100%;
                `}
              >
                <Button
                  primary
                  type="submit"
                  rounded
                  disabled={!props.isValid || secret.length === 0}
                  // isLoading={props.isSubmitting}
                >
                  Submit
                </Button>
              </div>
            </Form>
          </FormContainer>
        )}
      </Formik>
    </div>
  );
}

export default CreateNoteForm;
