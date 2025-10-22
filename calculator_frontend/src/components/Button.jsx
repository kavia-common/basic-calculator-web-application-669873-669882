import React from 'react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * Button
 * A reusable calculator button with variant styling and accessibility.
 */
export default function Button({ children, onClick, variant = 'default', wide = false, ariaLabel }) {
  const classNames = [
    'calc-btn',
    variant === 'operator' ? 'operator' : '',
    variant === 'action' ? 'action' : '',
    variant === 'equal' ? 'equal' : '',
    wide ? 'wide' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classNames}
      onClick={onClick}
      aria-label={ariaLabel || String(children)}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'operator', 'action', 'equal']),
  wide: PropTypes.bool,
  ariaLabel: PropTypes.string,
};

Button.defaultProps = {
  onClick: () => {},
  variant: 'default',
  wide: false,
  ariaLabel: undefined,
};
