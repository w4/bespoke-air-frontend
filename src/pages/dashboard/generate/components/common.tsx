export const optionStyles = {
    container: (provided: any, state: any) => ({
        ...provided,
        display: 'inline-block',
        width: 'auto',
    }),
    control: (provided: any, state: any) => ({
        ...provided,
        border: 'none !important',
        borderBottom: '1px dashed #535f8d !important',
        background: 'transparent',
        borderRadius: 0,
        color: '#535f8d',
        '&:hover': {
            textShadow: '0 0 0.15em #547e9b',
        }
    }),
    indicatorsContainer: () => ({
        display: 'none',
    }),
    valueContainer: (provided: any, state: any) => ({
        ...provided,
        display: 'block',
    }),
    singleValue: (provided: any, state: any) => ({
        ...provided,
        color: 'inherit',
        position: 'static',
        top: 'auto',
        left: 'auto',
        transform: 'none',
        maxWidth: 'none',
        whiteSpace: 'break-spaces',
        display: 'inline',
    }),
    input: (provided: any, state: any) => ({
        ...provided,
        display: 'inline-block',
    }),
    menu: (provided: any, state: any) => ({
        ...provided,
        whiteSpace: 'nowrap',
        width: 'auto',
        background: '#323f74'
    }),
    option: (provided: any, state: any) => ({
        ...provided,
        fontSize: '0.8em',
        color: state.isSelected ? '#535f8d' : 'white',
        background: state.isFocused ? 'rgba(0, 0, 0, 0.05) !important' : 'none !important',
    })
};
