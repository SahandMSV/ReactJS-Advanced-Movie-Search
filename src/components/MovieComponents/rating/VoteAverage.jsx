import useMovieStore from "../../../store/movieStore"

export default function VoteAverage() {
    const { movie } = useMovieStore();

    return <p className="average">{movie.vote_average.toFixed(1)}</p>;
}