import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import {
  CardElement,
  injectStripe,
  ReactStripeElements,
} from 'react-stripe-elements';
import { Modal, Button, Divider, Typography } from 'antd';
import moment, { Moment } from 'moment';
import { KeyOutlined } from '@ant-design/icons';
import { CREATE_BOOKING } from '../../../../lib/graphql/mutations';
import {
  CreateBooking as CreateBookingData,
  CreateBookingVariables,
} from '../../../../lib/graphql/mutations/CreateBooking/__generated__/CreateBooking';
import {
  displayErrorMessage,
  displaySuccessNotification,
  formatListingPrice,
} from '../../../../lib/utils';

interface Props {
  id: string;
  price: number;
  checkInDate: Moment;
  checkOutDate: Moment;
  modalVisible: boolean;
  setModalVisible: (modalVisible: boolean) => void;
  clearBookingData: () => void;
  handleListingRefetch: () => Promise<void>;
}

const { Paragraph, Text, Title } = Typography;

export const ListingCreateBookingModal = ({
  id,
  price,
  checkInDate,
  checkOutDate,
  modalVisible,
  setModalVisible,
  clearBookingData,
  handleListingRefetch,
  stripe,
}: Props & ReactStripeElements.InjectedStripeProps) => {
  const [createBooking, { loading }] = useMutation<
    CreateBookingData,
    CreateBookingVariables
  >(CREATE_BOOKING, {
    onCompleted: () => {
      clearBookingData();
      displaySuccessNotification(
        "You've successfully booked the listing!",
        'Booking history can always be found in your User page'
      );
      handleListingRefetch();
    },
    onError: () => {
      displayErrorMessage(
        "Sorry! we weren't able to successfully book the listing. Please try again later."
      );
    },
  });

  const daysBooked = checkOutDate.diff(checkInDate, 'days') + 1;
  const listingPrice = price * daysBooked;
  // const rentalsFree = 0.05 * listingPrice;
  // const totalPrice = listingPrice + rentalsFree;

  const handleCreateBooking = async () => {
    if (!stripe) {
      return displayErrorMessage(
        "Sorry! We weren't able to connect with Stripe."
      );
    }

    const { token, error } = await stripe.createToken();

    if (token) {
      createBooking({
        variables: {
          input: {
            source: token.id,
            checkIn: checkInDate.format('YYYY-MM-DD'),
            checkOut: checkOutDate.format('YYYY-MM-DD'),
            id,
          },
        },
      });
    } else {
      return displayErrorMessage(
        error && error.message
          ? error.message
          : "Sorry! We weren't able to book the listing. Please try again later."
      );
    }
  };

  return (
    <Modal
      visible={modalVisible}
      centered
      footer={null}
      onCancel={() => setModalVisible(false)}
    >
      <div className='listing-booking-modal'>
        <div className='listing-booking-modal__intro'>
          <Title className='listing-booking-modal__intro-title'>
            <KeyOutlined />
          </Title>
          <Title level={3} className='listing-booking-modal__intro-title'>
            Book your trip
          </Title>
          <Paragraph>
            Enter your payment information to book the listing fro the dates
            between{' '}
            <Text mark strong>
              {moment(checkInDate).format('MMMM Do YYYY')}
            </Text>{' '}
            and{' '}
            <Text mark strong>
              {moment(checkOutDate).format('MMMM Do YYYY')}
            </Text>
            , inclusive.
          </Paragraph>
        </div>

        <Divider />

        <div className='listing-booking-modal__charge-summary'>
          <Paragraph>
            {formatListingPrice(price)} * {daysBooked} days ={' '}
            <Text strong>{formatListingPrice(listingPrice)}</Text>
          </Paragraph>
          {/* <Paragraph>
            Rentals Free <sub>~ 5%</sub> ={' '}
            <Text strong>{formatListingPrice(rentalsFree)}</Text>
          </Paragraph> */}
          <Paragraph className='listing-booking-modal__charge-summary-total'>
            Total = <Text mark>{formatListingPrice(listingPrice)}</Text>
          </Paragraph>
        </div>

        <Divider />

        <div className='listing-booking-modal__stripe-card-section'>
          <CardElement
            hidePostalCode
            className='listing-booking-modal__stripe-card'
          />
          <Button
            size='large'
            type='primary'
            className='listing-booking-modal__cta'
            loading={loading}
            onClick={handleCreateBooking}
          >
            Book
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const WrappedListingCreateBookingModal = injectStripe(
  ListingCreateBookingModal
);
