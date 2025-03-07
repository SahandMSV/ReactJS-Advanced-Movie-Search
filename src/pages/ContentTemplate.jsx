/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from 'react';
import Loading from '../components/app/Loading';

import CastScroller from '../components/contentPage/cast/CastScroller';
import useContentStore from '../stores/contentStore';

import MediaExpandable from '../components/contentPage/MediaExpandable';
import DynamicButton from '../components/buttons/DynamicButton';
import MovieMeta from '../components/moviePage/MovieMeta';
import ShowsMeta from '../components/showsPage/ShowsMeta';
import MediaGenre from '../components/contentPage/MediaGenre';
import MediaRating from '../components/contentPage/MediaRating';
import MediaPoster from '../components/contentPage/MediaPoster';
import sprite from '../styles/sprite.svg';
import { ReactSVG } from 'react-svg';

const ContentTemplate = ({ type, media, creditsData, genresMap }) => {
    const isMovie = type === 'Movie' ? true : false;
    const mediaTitle = isMovie ? media.title : media.name;
    const showFormattedDate = !isMovie ? (
        media.in_production ? (
            <span title={new Date(media.first_air_date).toLocaleDateString('en-GB')}>
                Since {media.first_air_date.slice(0, 4)}
            </span>
        ) : (
            <>
                <span title={new Date(media.first_air_date).toLocaleDateString('en-GB')}>
                    {media.first_air_date.slice(0, 4)}
                </span>
                {' - '}
                <span title={new Date(media.last_air_date).toLocaleDateString('en-GB')}>
                    {media.last_air_date.slice(0, 4)}
                </span>
            </>
        )
    ) : null;

    if (!media || !genresMap) {
        return <Loading />;
    }

    // Format runtime into hours and minutes
    const formatRuntime = (runtime) =>
        !runtime
            ? null
            : runtime < 60
              ? `${runtime} min`
              : `${Math.floor(runtime / 60)} h${runtime % 60 ? ` ${runtime % 60} min` : ''}`;

    // Format content rating and tooltip text
    const formattedRating = media.adult ? 'Rated R' : 'Rated PG';
    const ratingTitle = media.adult
        ? `R-rated movies are for adults, containing \nstrong language, sexual content, violence, \nor drug use. Viewer discretion is advised.`
        : `PG-rated movies are suitable for general \naudiences but may have material that requires \nparental guidance for younger children.`;

    const numberOfCastMembers =
        creditsData && creditsData.cast ? creditsData.cast.length : 0;

    // Determine title size class based on length
    const getMovieTitleClass = (title) => {
        if (!title) return 'media-title--small';
        const length = title.length;

        switch (true) {
            case length < 25:
                return 'media-title--large';
            case length < 40:
                return 'media-title--medium';
            default:
                return 'media-title--small';
        }
    };

    // Get poster image path or return null (going to be replaced by placeholder) if false
    const imagePath =
        media.poster_path || media.profile_path
            ? `https://image.tmdb.org/t/p/w500${media.poster_path || media.profile_path}`
            : null;

    return (
        <div className="content-container">
            <div className="content-template__background-overlay"></div>
            <div className="content-template__detail-container">
                <div className="content-template__heading-section">
                    {/* Media poster image or placeholder */}
                    <MediaPoster imagePath={imagePath} mediaTitle={mediaTitle} />

                    <div className="content-template__main-details">
                        <div className={`media-title ${getMovieTitleClass(mediaTitle)}`}>
                            {mediaTitle}
                        </div>

                        {isMovie ? (
                            // Movie metadata: release year, runtime, rating
                            <MovieMeta
                                releaseDate={media.release_date}
                                adult={media.adult}
                                ratingTitle={ratingTitle}
                                formattedRating={formattedRating}
                                formattedRuntime={formatRuntime(media.runtime)}
                            />
                        ) : (
                            // TV show metadata: air dates, seasons, rating
                            <ShowsMeta
                                showFormattedDate={showFormattedDate}
                                seasonsCount={media.seasons.length}
                                adult={media.adult}
                                ratingTitle={ratingTitle}
                                formattedRating={formattedRating}
                            />
                        )}

                        {/* Genre tags */}
                        <MediaGenre genres={media.genres} />

                        {/* Rating metrics */}
                        <MediaRating
                            voteAverage={media.vote_average}
                            voteCount={media.vote_count}
                            popularity={media.popularity}
                        />

                        {/* Overview section */}
                        <MediaExpandable
                            titleText="Overview"
                            content={media.overview}
                            expanderText={['Expand', 'Collapse']}
                        />
                    </div>
                </div>
                {/* Cast section */}
                {creditsData && creditsData.cast && (
                    <div className="content-template__cast-section">
                        <div className="content-template__cast-header">
                            <p className="content-template__cast-title">
                                Cast Members
                                <DynamicButton className="content-template__cast-count">
                                    {numberOfCastMembers}
                                </DynamicButton>
                                <svg className="content-template__cast-icon">
                                    <use xlinkHref={`${sprite}#arrow-forward`} />
                                </svg>
                            </p>
                            <DynamicButton className="content-template__view-full-credits-button">
                                Cast & crew
                            </DynamicButton>
                        </div>

                        <CastScroller />
                    </div>
                )}
            </div>

            <ReactSVG src={sprite} style={{ display: 'none' }} />
        </div>
    );
};

export default ContentTemplate;
