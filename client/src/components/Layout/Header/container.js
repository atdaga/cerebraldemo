import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Header from './Header';

const mapStateToProps = (state) => {
  return {
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));

