/* eslint-disable react/prop-types */
import useMovieStore from "../../store/movieStore";
import ExpanderButton from "../buttons/ExpanderButton";

export default function Overview({ isExpanded, toggleDescriptionExpand }) {
    
    const { movie } = useMovieStore();
    
    return (
        <>
            <p className="info">{movie.overview}</p>
            <ExpanderButton isExpanded={isExpanded} onClick={toggleDescriptionExpand}/>
        </>
    );
}
