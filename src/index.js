import React from "react";
import { render } from "react-dom";
import {
  compose,
  mapProps,
  withHandlers,
  withState,
  withProps
} from "recompose";
import { AsyncCreatable } from "react-select";
import "react-select/dist/react-select.css";
import Modal from "material-ui/Modal";

const db = [
  { id: 1, value: "one", happy: true },
  { id: 2, value: "two", happy: false },
  { id: 3, value: "three", happy: true },
  { id: 4, value: "four", happy: true },
  { id: 5, value: "five", happy: false },
  { id: 6, value: "six", happy: false }
];
const ES = {
  async search(term) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!term) resolve(db);
        else resolve(db.filter(({ value }) => value.startsWith(term)));
      }, 1000);
    });
  },
  async create(value) {
    return new Promise((resolve, reject) => {
      const { id } = db[db.length - 1];
      const option = {
        id: id + 1,
        value,
        happy: true
      };

      db.push(option);
      resolve(option);
    });
  }
};

const cache = withState("cache", "setCache", {});
const value = withState("value", "setValue", null);
const element = withState("element", "setElement", null);
const show = withState("show", "showModal", false);
const option = withState("option", "setOption", null);

const state = compose(element, cache, value, show, option);

const handlers = withHandlers({
  loadOptions() {
    return async input => ({
      options: await ES.search(input)
    });
  },
  onChange({ setValue }) {
    return change => {
      setValue(change.split(","));
    };
  },
  addOption({ cache, setCache, setValue, value }) {
    return option => {
      setCache({
        ...cache,
        [option.value]: [option]
      });

      setValue([...(value || []), option.id]);
    };
  },
  onNewOptionClick({ setOption, showModal }) {
    return async ({ value }) => {
      setOption({ value });
      showModal(true);
    };
  },
});
const modalHandlers = withHandlers({
  onRequestClose({ addOption, option, showModal }) {
    return async () => {
      // const option = await ES.create(value);
      console.log(option);
      showModal(false);
    };
  },
})

// const modalProps = compose(
//   withHandlers({
//     createOption({ showModal, setOption, setOptionRequest }) {
//       return async value => {
//         showModal(true);
        // const request = Promise.then();

        // setOption({ value });
        // setOptionRequest(request);

        // return request;
//       };
//     }
//   }),
//   mapProps(props => ({ modalProps: { ...props } }))
// );

const log = withProps(console.log);

const enhance = compose(state, handlers, modalHandlers);

const styles = {
  fontFamily: "sans-serif"
};

const App = enhance(({ onRequestClose, show, ...props }) => (
  <div style={styles}>
    <AsyncCreatable
      multi
      labelKey="value"
      valueKey="id"
      simpleValue
      {...props}
    />

    <Modal {...{onRequestClose, show}}>
      <div>Test Modal</div>
    </Modal>
  </div>
));

render(<App />, document.getElementById("root"));
