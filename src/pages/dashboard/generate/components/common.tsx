export const optionStyles = {
    container: (provided: any, state: any) => ({
        ...provided,
        display: 'inline-block',
        width: 'auto',
    }),
    control: (provided: any, state: any) => ({
        ...provided,
        border: 'none !important',
        borderBottom: '1px dashed #b14943 !important',
        background: 'transparent',
        borderRadius: 0,
        color: '#b14943',
        '&:hover': {
            color: '#333',
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
        background: '#76C3BD'
    }),
    option: (provided: any, state: any) => ({
        ...provided,
        fontSize: '0.8em',
        color: state.isSelected ? '#478982' : 'white',
        background: state.isFocused ? 'rgba(0, 0, 0, 0.05) !important' : 'none !important',
    })
};
