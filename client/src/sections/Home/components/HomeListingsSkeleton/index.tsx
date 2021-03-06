import React from 'react';
import { Card, Skeleton, List } from 'antd';
import listingsLoadingCardCover from '../../assets/listing-loading-card-cover.jpg';

export const HomeListingsSkeleton = () => {
  const emptyData = [{}, {}, {}, {}];
  return (
    <div className='home-listings-skeleton'>
      <Skeleton paragraph={{ rows: 0 }} />
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          xxl: 4,
        }}
        dataSource={emptyData}
        renderItem={() => (
          <List.Item>
            <Card
              cover={
                <div
                  style={{
                    backgroundImage: `url(${listingsLoadingCardCover})`,
                  }}
                  className='home-listings-skeleton__card-cover-img'
                ></div>
              }
              loading
            />
          </List.Item>
        )}
      />
    </div>
  );
};
