-- create database movie_booking;
-- use movie_booking;

create table user(
user_id varchar(36) primary key,
first_name varchar(100),
last_name varchar(100),
phone varchar(10),
email varchar(100),
password varchar(500)
);

alter table user drop column gender;

create table theater(
theater_id varchar(36) primary key,
theater_name varchar(100),
email varchar(100),
phone varchar(10),
capacity int,
city varchar(50),
theater_address varchar(100)
);
-- alter table theater add column password varchar(100);
-- update theater set password = "$2a$05$J1hBGkYFEsbA27/eqwlIiuUYsgqOQRQUhBcVqrHOP.VKAg3BL5PYG";

create table movie(
movie_id varchar(36) primary key,
movie_name varchar(100),
description text,
duration time,
rating decimal(3,2),
genre varchar(50),
poster_url varchar(500),
banner_url varchar(500),
release_date date
);

alter table movie rename column banner_url to actors;
alter table movie add column director varchar(100);
alter table movie add column language varchar(100);
alter table movie modify release_date varchar(30);

create table theater_movie(
theater_movie_id varchar(36) primary key,
theater_id varchar(36),
movie_id varchar(36),
price decimal(5,2),
date date,
foreign key (theater_id) references theater(theater_id) on delete cascade,foreign key (movie_id) references movie(movie_id) on delete cascade
);

create table theater_movie_time(
theater_movie_time_id varchar(36) primary key,
theater_movie_id varchar(36),
time time,
foreign key (theater_movie_id) references theater_movie(theater_movie_id) on delete cascade);

create table seat(
seat_id varchar(36) primary key,
theater_movie_time_id varchar(36),
seat_nmber int,
status_id int,
foreign key (theater_movie_time_id) references theater_movie_time(theater_movie_time_id) on delete cascade
);

create table status(
status_id int primary key,
status_name varchar(20)
);

create table booking(
booking_id varchar(36) primary key,
booking_date date,
user_id varchar(36),
status_id int,
theater_movie_time_id varchar(36),
foreign key (user_id) references user(user_id) on delete cascade,
foreign key (status_id) references status(status_id) on delete cascade,
foreign key (theater_movie_time_id) references theater_movie_time(theater_movie_time_id) on delete cascade
);

create table booking_details(
booking_details_id varchar(36) primary key,
booking_id varchar(36),
seat_id varchar(36),
foreign key (booking_id) references booking(booking_id) on delete cascade,
foreign key (seat_id) references seat(seat_id) on delete cascade
);

create table feedback(
feedback_id varchar(36) primary key,
movie_id varchar(36),
user_id varchar(36),
rating int,
foreign key (movie_id) references movie(movie_id) on delete cascade,
foreign key (user_id) references user(user_id) on delete cascade
);



insert into status values(1,"Booked"),(2,"Cancelled"),(3,"available");
select m.movie_name,m.description,tm.price,tm.date from movie m join theater_movie tm on tm.movie_id = m.movie_id where theater_id = "1f9d8a54-ab7c-4d9a-8e8c-dc9e6e2e68d1";
select * from status;
select * from user;
select * from theater;
select * from movie;
select * from theater_movie;
select * from seat;
select * from theater_movie_time;
select * from booking;
select * from booking_details;
select * from feedback;

delete from user where user_id = '42d99d28-fa23-4ed1-84d1-c8b74a6f6f70';

select count(tm.theater_movie_id) as count from theater_movie_time tmt join theater_movie tm on tmt.theater_movie_id = tm.theater_movie_id where tm.date = '2024-09-11' and tm.theater_movie_id = 'f1b6bbfe-eb64-4343-937a-0f41ae5c5791';

-- delete from theater;
-- delete from movie;
-- delete from user;
-- delete from theater_movie;
-- delete from seat;
-- delete from theater_movie_time;
-- delete from booking;
-- delete from booking_details;
-- delete from feedback;

-- drop table booking_details;
-- drop table booking;
-- drop table seat;
-- drop table theater_movie_time;
-- drop table theater_movie;
-- drop table feedback;
-- drop table movie;
-- drop table theater;
-- drop table user;
-- drop table booking_details;
-- drop table booking;

-- trigger to add seats into seat table when movie is added into a theater_movie_time based on the capacity of the theater
delimiter //


create trigger add_seats after insert on theater_movie_time for each row
begin
declare capc int;
declare i int default 0;
select distinct capacity into capc from theater t join theater_movie tm join theater_movie_time tmv on t.theater_id = tm.theater_id and tm.theater_movie_id = tmv.theater_movie_id where tmv.theater_movie_id = New.theater_movie_id;
while i < capc do
insert into seat values(uuid(),New.theater_movie_time_id, i,3);
set i= i+1;
end while;
end //
delimiter ;


-- drop trigger add_seats;

-- trigger to make the seat available after cancellation of booked seat
delimiter //
create trigger make_available after update on booking for each row
begin
update seat set status_id = 3 where New.seat_id = seat_id;
end //
delimiter ;

-- trigger to mark a seat as booked after a booking is made on seat
delimiter //
create trigger mark_booked after insert on booking for each row
begin
update seat set status_id = 1 where New.seat_id = seat_id;
end //
delimiter ;

-- trigger to calculate the average rating for a movie when a rating added for a movie by user
delimiter //
create trigger modifyRating after insert on feedback
for each row
begin
declare rating_count int;
select count(feedback_id) into rating_count from feedback where movie_id = New.movie_id;
update movie set rating = round(((rating * rating_count)+New.rating)/(rating_count),1) where movie_id = New.movie_id;
end //
delimiter ;



INSERT INTO user (user_id, first_name, last_name, phone, gender, email, password)
VALUES
    ('1e9d8a54-bd7f-4d9a-8d7c-dc8e6e2e68d1', 'John', 'Doe', '1234567890', 'Male', 'john.doe@example.com', '$2a$05$J1hBGkYFEsbA27/eqwlIiuUYsgqOQRQUhBcVqrHOP.VKAg3BL5PYG'),
    ('2b6c4a76-e94d-4e2f-88ee-2c9b5e9b7f7b', 'Jane', 'Smith', '2345678901', 'Female', 'jane.smith@example.com', '$2a$05$IlBtDOvcPbS/EVzxJEFNW.UyBp5JVsfxS73WpfqtVQXt0bA8q.y0i'),
    ('3d9a5b43-cb2f-4e7a-8b9f-8e3d6d2f8a6a', 'Alice', 'Johnson', '3456789012', 'Female', 'alice.johnson@example.com', '$2a$05$xa6Alz6d9wMSImb/CbYA2On.o3V8Qj3AakRp5bQxMKO0snxFPD/9O'),
    ('4e0b8c54-fc3f-4c6b-9f1e-9b5f6a7d9c8d', 'Bob', 'Williams', '4567890123', 'Male', 'bob.williams@example.com', '$2a$05$IyO92iZ3Ir8XlxdveXhaFuhWlSA5VIIZToTL4kv.iJV6SX3oe/dX6'),
    ('5f1c9d65-gd4g-4d9a-8c1b-6c7e8e9e0f9f', 'Carol', 'Brown', '5678901234', 'Female', 'carol.brown@example.com', '$2a$05$HRAnISKOl4YDSVkl4ltUU.OIZKC3x5PrAhozVa4QrV9.b8ZwcxusC');

INSERT INTO theater (theater_id, theater_name, email, phone, capacity, city, theater_address)
VALUES
    ('1f9d8a54-ab7c-4d9a-8e8c-dc9e6e2e68d1', 'Grand Cinema', 'contact@grandcinema.com', '1234567890', 250, 'New York', '123 Broadway Ave'),
    ('2c8b4a76-d94d-4e2f-88ee-2c9b5e9b7f7b', 'Sunset Theater', 'info@sunsettheater.com', '2345678901', 180, 'Los Angeles', '456 Sunset Blvd'),
    ('3e9a5b43-db2f-4e7a-8b9f-8e3d6d2f8a6a', 'Elite Cinemas', 'hello@elitecinemas.com', '3456789012', 300, 'Chicago', '789 State St'),
    ('4d0b8c54-eb3f-4c6b-9f1e-9b5f6a7d9c8d', 'Regal Theaters', 'support@regaltheaters.com', '4567890123', 200, 'San Francisco', '101 Market St'),
    ('5c1d9e65-fd4g-4d9a-8c1b-6c7e8e9e0f9f', 'CineWorld', 'contact@cineworld.com', '5678901234', 220, 'Miami', '202 Ocean Drive');
   
INSERT INTO movie (movie_id, movie_name, description, duration, rating, genre, poster_url, banner_url, release_date)
VALUES
  ('1e8b7a54-a78c-4d9a-8e8c-dc9e6e2e68d1', 'The Great Adventure', 'An epic journey through mythical lands.', '02:30:00', 8.7, 'Adventure', 'https://example.com/poster1.jpg', 'https://example.com/banner1.jpg', '2023-12-31'),
  ('2f9c4b76-b94d-4e2f-88ee-2c9b5e9b7f7b', 'Romantic Nights', 'A heartwarming tale of love and romance.', '01:45:00', 7.9, 'Romance', 'https://example.com/poster2.jpg', 'https://example.com/banner2.jpg', '2024-01-15'),
  ('3a5d6c43-cb2f-4e7a-8b9f-8e3d6d2f8a6a', 'Mystery of the Lost City', 'A thrilling mystery set in an ancient city.', '02:15:00', 9.0, 'Mystery', 'https://example.com/poster3.jpg', 'https://example.com/banner3.jpg', '2024-02-28'),
  ('4b0e8c54-dc3f-4c6b-9f1e-9b5f6a7d9c8d', 'Space Odyssey', 'A sci-fi adventure in the far reaches of space.', '03:00:00', 8.5, 'Sci-Fi', 'https://example.com/poster4.jpg', 'https://example.com/banner4.jpg', '2024-03-18'),
  ('5c1f9e65-ec4g-4d9a-8c1b-6c7e8e9e0f9f', 'Comedy Nights', 'A collection of hilarious sketches and jokes.', '01:30:00', 7.5, 'Comedy', 'https://example.com/poster5.jpg', 'https://example.com/banner5.jpg', '2024-04-12');
 
  INSERT INTO movie (movie_id, movie_name, description, duration, rating, genre, poster_url, banner_url, release_date)
VALUES
  ('6d2g9f76-fd5h-4e1a-9d2c-7e3f8e9e1g0g', 'Historical Epic', 'A dramatic portrayal of a historical event.', '02:50:00', 8.8, 'Drama', 'https://example.com/poster6.jpg', 'https://example.com/banner6.jpg', '2024-08-26'),
  ('7e3h0g87-ge6i-4f2b-9e3d-8f4g9e0f2h1h', 'Action Hero', 'An action-packed film with a brave hero.', '02:00:00', 8.2, 'Action', 'https://example.com/poster7.jpg', 'https://example.com/banner7.jpg', '2024-09-01'),
  ('8f4i1h98-hf7j-4g3c-9f4e-9g5h0e1g3i2i', 'Horror Nights', 'A chilling horror film that will keep you on edge.', '01:45:00', 7.8, 'Horror', 'https://example.com/poster8.jpg', 'https://example.com/banner8.jpg', '2024-10-15'),
  ('9g5j2k09-if8k-4h4d-9g5f-0h6i1g2h4j3j', 'Family Fun', 'A delightful family movie for all ages.', '01:40:00', 7.6, 'Family', 'https://example.com/poster9.jpg', 'https://example.com/banner9.jpg', '2024-11-25'),
  ('0h6k3l10-jg9l-4i5e-9h6g-1i7j2k3l5m4m', 'Documentary World', 'An insightful documentary about world cultures.', '02:20:00', 8.0, 'Documentary', 'https://example.com/poster10.jpg', 'https://example.com/banner10.jpg', '2024-12-31');

commit;

select b.booking_id,t.theater_name,m.movie_name,tmt.time,tm.price,b.booking_date,count(b.booking_id) as seats_count from booking b join booking_details bd join theater_movie_time tmt join theater_movie tm join theater t join movie m
on b.booking_id = bd.booking_id and b.theater_movie_time_id = tmt.theater_movie_time_id and tm.theater_movie_id = tmt.theater_movie_id
and t.theater_id = tm.theater_id and m.movie_id = tm.movie_id where b.status_id = 1 and user_id = "1e9d8a54-bd7f-4d9a-8d7c-dc8e6e2e68d1" group by b.booking_id;


select tm.theater_movie_id,t.theater_name,m.movie_name,t.city,t.theater_address,tm.price,tm.date from theater_movie tm join theater t join movie m
on t.theater_id = tm.theater_id and m.movie_id=tm.movie_id where tm.movie_id= "1e8b7a54-a78c-4d9a-8e8c-dc9e6e2e68d1";

select tmt.theater_movie_time_id,m.movie_name,m.description,tm.price,tm.date,tmt.time,tm.theater_movie_id,m.movie_id from movie m join theater_movie tm join theater_movie_time tmt
on tm.movie_id = m.movie_id and tmt.theater_movie_id = tm.theater_movie_id where tm.theater_id = "2c8b4a76-d94d-4e2f-88ee-2c9b5e9b7f7b";

select count(movie_id) as count from theater_movie where movie_id = "40509ec2-c3b2-4dc2-a46b-a906dd0ab2b0";

-- delete from theater_movie_time where theater_movie_time_id = "4b68c166-0ff9-4303-a836-4ba7f322c4d2";
-- select count(*) from seat;

-- user : 1234567890 hashedpassword1
-- publisher : 2345678901 hashedpassword1

select u.first_name,u.last_name,m.movie_name,tm.date,tmt.time from booking b join theater_movie_time tmt join user u join theater_movie tm join movie m
on b.theater_movie_time_id = tmt.theater_movie_time_id and tmt.theater_movie_id = tm.theater_movie_id and tm.movie_id = m.movie_id and b.user_id = u.user_id where u.user_id = "1e9d8a54-bd7f-4d9a-8d7c-dc8e6e2e68d1";

select count(tm.theater_movie_id) as count from theater_movie_time tmt join theater_movie tm on tmt.theater_movie_id = tm.theater_movie_id
where tm.date = ? and tm.theater_movie_id = ?;

select * from movie where genre like '%Animation%';

select tm.theater_movie_id,t.theater_name,m.movie_name,t.city,t.theater_address,tm.price,tm.date from theater_movie tm join theater t join movie m on t.theater_id = tm.theater_id and m.movie_id=tm.movie_id where tm.movie_id= "f771a76b-0dd6-45ed-a5cb-433e6d204e5f";

select t.theater_name,m.movie_name,tm.date,tmt.time from booking b join theater_movie_time tmt join theater_movie tm join theater t join movie m
on b.theater_movie_time_id = tmt.theater_movie_time_id and tmt.theater_movie_id = tm.theater_movie_id and tm.theater_id = t.theater_id and tm.movie_id = m.movie_id
where b.booking_id='dcef5164-9512-43ed-ba07-02a16382a634';
select u.email,b.booking_id from user u join booking b on u.user_id = b.user_id where theater_movie_time_id = '09944505-fe6f-443d-8208-c890778ed40a' and b.status_id=1;
select * from booking;
select * from theater_movie_time;
select * from theater_movie;

select u.email,b.booking_id from user u join booking b on u.user_id = b.user_id where theater_movie_time_id = "97a4debb-572c-4696-9394-e29311ca48b9" and b.status_id=1;