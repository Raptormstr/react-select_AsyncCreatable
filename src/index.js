import React from "react";
import { render } from "react-dom";
import { compose, withHandlers, withState } from "recompose";
import { AsyncCreatable } from "react-select";
import "react-select/dist/react-select.css";

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
      console.log("Search Term:", term);
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
const state = compose(cache, value);

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
  onNewOptionClick({ cache, setCache, value: currentValues, setValue }) {
    return async ({ value }) => {
      const option = await ES.create(value);

      setCache({
        ...cache,
        [value]: [option]
      });

      setValue([...(currentValues || []), option.id]);
    };
  }
});

const enhance = compose(state, handlers);

const styles = {
  fontFamily: "sans-serif"
};

const App = enhance(props => (
  <div style={styles}>
    {console.log(props.cache)}
    <AsyncCreatable
      multi
      labelKey="value"
      valueKey="id"
      simpleValue
      {...props}
    />
  </div>
));

render(<App />, document.getElementById("root"));
