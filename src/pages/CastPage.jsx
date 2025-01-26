import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import useFetchStore from '../stores/fetchStore';
import useCastStore from '../stores/castStore';
// import Loading from '../components/app/Loading';
import MediaPoster from '../components/contentPage/MediaPoster';
import CastMemberDetailsInfo from '../components/castPage/CastMemberDetailsInfo';
import FilmographySection from '../components/castPage/FilmographySection';

export default function CastPage() {
    // Renamed to CastMemberDetailsHeader and export default changed
    const { id: castId } = useParams();
    const { fetchCastDetails, fetchCastCredits } = useFetchStore();
    const { setCast, setCastCredits } = useCastStore();
    const [isBioModalOpen, setIsBioModalOpen] = useState(false);
    const [bioSource, setBioSource] = useState('tmdb');
    const infoRef = useRef(null);
    const bioModalRef = useRef(null);

    const {
        data: castDetailsData,
        isLoading: castDetailsLoading,
        error: castDetailsError
    } = useQuery({
        queryKey: ['castDetails', castId],
        queryFn: () => fetchCastDetails(castId),
        enabled: !!castId
    });

    const {
        data: castCreditsData,
        isLoading: castCreditsLoading, // Added isLoading and error
        error: castCreditsError // for castCreditsData for loading state in filmography
    } = useQuery({
        queryKey: ['castCredits', castId],
        queryFn: () => fetchCastCredits(castId),
        enabled: !!castId
    });

    const numberOfMedia = useMemo(() => {
        return castCreditsData?.cast?.length || 0;
    }, [castCreditsData]);

    useEffect(() => {
        if (castDetailsData) {
            setCast(castDetailsData);
        }
        if (castCreditsData) {
            setCastCredits(castCreditsData);
        }
    }, [castCreditsData, castDetailsData, setCast, setCastCredits]);

    const handleCloseBioModal = useCallback(() => {
        setIsBioModalOpen(false);
    }, []);

    const handleOpenBioModal = useCallback(() => {
        setIsBioModalOpen(true);
    }, []);

    const handleEscapeKey = useCallback(
        (event) => {
            if (event.key === 'Escape' && isBioModalOpen) {
                handleCloseBioModal();
            }
        },
        [isBioModalOpen, handleCloseBioModal]
    );

    useEffect(() => {
        if (isBioModalOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        } else {
            document.removeEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isBioModalOpen, handleEscapeKey]);

    const calculateAge = useCallback((birthDate, deathDate) => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const endDate = deathDate ? new Date(deathDate) : new Date();

        let age = endDate.getFullYear() - birth.getFullYear();
        const monthDiff = endDate.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }, []);

    const age = useMemo(() => {
        if (!castDetailsData?.birthday) return null;
        return calculateAge(castDetailsData.birthday, castDetailsData?.deathday);
    }, [castDetailsData?.birthday, castDetailsData?.deathday, calculateAge]);

    const fetchWikipediaBio = useCallback(async (actorName) => {
        if (!actorName) return null;
        const searchTerm = encodeURIComponent(actorName);
        const baseURL = 'https://en.wikipedia.org/w/api.php';

        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            origin: '*',
            prop: 'extracts',
            titles: searchTerm,
            exintro: true,
            explaintext: true
        });

        const apiUrl = `${baseURL}?${params.toString()}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            const pages = data.query?.pages;
            if (!pages) return null;

            const pageId = Object.keys(pages)[0];
            if (pageId === '-1') return null;

            return pages[pageId]?.extract || null;
        } catch (error) {
            console.error('Error fetching Wikipedia biography:', error);
            return null;
        }
    }, []);

    const {
        data: wikipediaBio,
        isLoading: wikipediaBioLoading,
        error: wikipediaBioError
    } = useQuery({
        queryKey: ['wikipediaBio', castDetailsData?.name],
        queryFn: () => fetchWikipediaBio(castDetailsData?.name),
        enabled: !!castDetailsData?.name,
        staleTime: Infinity,
        cacheTime: Infinity
    });

    const handleModalClickOutside = useCallback(
        (event) => {
            if (
                isBioModalOpen &&
                bioModalRef.current &&
                !bioModalRef.current.contains(event.target)
            ) {
                handleCloseBioModal();
            }
        },
        [isBioModalOpen, handleCloseBioModal]
    );

    useEffect(() => {
        document.body.style.overflow = isBioModalOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isBioModalOpen]);

    useEffect(() => {
        if (isBioModalOpen) {
            document.addEventListener('mousedown', handleModalClickOutside);
        } else {
            document.removeEventListener('mousedown', handleModalClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleModalClickOutside);
        };
    }, [isBioModalOpen, handleModalClickOutside]);

    const castDetailsInfoProps = useMemo(
        () => ({
            age,
            handleOpenBioModal,
            renderModal: isBioModalOpen,
            isBioModalOpen,
            bioModalRef,
            handleCloseBioModal,
            bioSource,
            setBioSource,
            castDetailsLoading,
            castDetailsError,
            wikipediaBioLoading,
            wikipediaBioError,
            wikipediaBio
        }),
        [
            age,
            handleOpenBioModal,
            isBioModalOpen,
            bioModalRef,
            handleCloseBioModal,
            bioSource,
            setBioSource,
            castDetailsLoading,
            castDetailsError,
            wikipediaBioLoading,
            wikipediaBioError,
            wikipediaBio
        ]
    );

    return (
        <div className="cast-member-details-page">
            <div className="cast-member-details-page__header">
                <div className="cast-member-details-page__poster-container">
                    {castDetailsLoading && !castDetailsData ? (
                        <div>Loading poster...</div>
                    ) : castDetailsError ? (
                        <div>Error loading poster.</div>
                    ) : (
                        <MediaPoster
                            imagePath={`https://image.tmdb.org/t/p/w500${castDetailsData?.profile_path}`}
                            mediaTitle={castDetailsData?.name}
                        />
                    )}
                </div>
                <div className="cast-member-details-page__info" ref={infoRef}>
                    <CastMemberDetailsInfo
                        {...castDetailsInfoProps}
                        castDetailsData={castDetailsData}
                    />
                    {castCreditsLoading && !castCreditsData ? (
                        <div>Loading filmography...</div>
                    ) : castCreditsError ? (
                        <div>Error loading filmography.</div>
                    ) : (
                        <FilmographySection
                            castDetailsData={castDetailsData}
                            castCreditsData={castCreditsData}
                            numberOfMedia={numberOfMedia}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

CastPage.propTypes = {
    // Updated propTypes to be for CastMemberDetailsPage (now Header) and to expect castId
    castId: PropTypes.string.isRequired
};

CastPage.displayName = 'CastMemberDetailsHeader'; // Updated displayName
