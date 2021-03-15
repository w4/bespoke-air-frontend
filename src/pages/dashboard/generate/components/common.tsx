const optionValueStyles = (provided: any, state: any) => ({
  ...provided,
  color: "inherit",
  position: "static",
  top: "auto",
  left: "auto",
  transform: "none",
  maxWidth: "none",
  whiteSpace: "break-spaces",
  display: "inline",
});

export const optionStyles = {
  container: (provided: any, state: any) => ({
    ...provided,
    display: "inline-block",
    width: "auto",
  }),
  control: (provided: any, state: any) => ({
    ...provided,
    border: "none !important",
    borderBottom: "1px dashed #535f8d !important",
    background: "transparent",
    borderRadius: 0,
    color: "#535f8d",
    "&:hover": {
      textShadow: "0 0 0.15em #547e9b",
    },
  }),
  indicatorsContainer: () => ({
    display: "none",
  }),
  valueContainer: (provided: any, state: any) => ({
    ...provided,
    display: "block",
  }),
  singleValue: optionValueStyles,
  placeholder: (provided: any, state: any) => ({
    ...optionValueStyles(provided, state),
    animationDuration: '1.25s',
    animationFillMode: 'forwards',
    animationIterationCount: 'infinite',
    animationName: 'placeHolderShimmer',
    animationTimingFunction: 'linear',
    background: ['#fff', 'linear-gradient(to right, #3700b3 8%, #6200ee 18%, #3700b3 33%)'],
    backgroundSize: '800px 104px',
  }),
  input: (provided: any, state: any) => ({
    ...provided,
    display: "inline-block",
  }),
  menu: (provided: any, state: any) => ({
    ...provided,
    whiteSpace: "nowrap",
    width: "auto",
    background: "#323f74",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    fontSize: "0.8em",
    color: state.isSelected ? "#535f8d" : "white",
    background: state.isFocused
      ? "rgba(0, 0, 0, 0.05) !important"
      : "none !important",
  }),
};
