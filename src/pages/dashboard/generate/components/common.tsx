import tinycolor from 'tinycolor2';

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

export const optionStyles = (colour: string, colourDarker: string) => ({
  container: (provided: any, state: any) => ({
    ...provided,
    display: "inline-block",
    width: "auto",
  }),
  control: (provided: any, state: any) => ({
    ...provided,
    border: "none !important",
    borderBottom: `1px dashed ${colour} !important`,
    background: "transparent",
    borderRadius: 0,
    color: colour,
    "&:hover": {
      textShadow: "0 0 0.15em " + tinycolor(colour).lighten(20).toString(),
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
    animationDuration: '1s',
    animationFillMode: 'forwards',
    animationIterationCount: 'infinite',
    animationName: 'placeHolderShimmer',
    animationTimingFunction: 'linear',
    background: ['#fff', `linear-gradient(to right, ${colour} 8%, ${colourDarker} 18%, ${colour} 33%)`],
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
    background: '#000',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    fontSize: "0.8em",
    color: state.isSelected ? colour : "white",
    background: state.isFocused
      ? "rgba(255, 255, 255, 0.05) !important"
      : "none !important",
  }),
});
