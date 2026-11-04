import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import type { PetKind } from '../domain';

// Vector artwork stays sharp on both phones and reacts to the pet's care state.
export function PetPortrait({ kind, resting = false, grown = false, size = 250 }: { kind: PetKind; resting?: boolean; grown?: boolean; size?: number }) {
  const fur = kind === 'cat' ? '#E5C69D' : kind === 'dog' ? '#D4AC8A' : kind === 'bear' ? '#DDB69E' : '#F5E9DE';
  const outline = '#5C4738';
  return <Svg width={size} height={size} viewBox="0 0 280 260" accessibilityLabel={`${resting ? 'Sleepy' : 'Happy'} ${kind}`}>
    <Ellipse cx="140" cy="226" rx="104" ry="18" fill="#E3D7C8" />
    {kind !== 'bear' && <Path d="M208 190Q254 146 245 193Q247 220 209 215" stroke={fur} strokeWidth="20" fill="none" strokeLinecap="round" />}
    <Ellipse cx="140" cy="180" rx={grown ? 72 : 61} ry="55" fill={fur} />
    <Ellipse cx="140" cy="190" rx="36" ry="30" fill="#FFF4E7" />
    <Ellipse cx="102" cy="222" rx="25" ry="11" fill={fur} /><Ellipse cx="178" cy="222" rx="25" ry="11" fill={fur} />
    {kind === 'bear' ? <G><Circle cx="88" cy="71" r="27" fill={fur} /><Circle cx="192" cy="71" r="27" fill={fur} /><Circle cx="88" cy="71" r="15" fill="#E8B8AC" /><Circle cx="192" cy="71" r="15" fill="#E8B8AC" /></G> : kind === 'cat' ? <G><Path d="M74 103L73 38L120 74M162 74L207 38L206 107" fill={fur} /><Path d="M83 80L83 54L108 77M174 77L197 54L196 82" fill="#D99E98" /></G> : kind === 'bunny' ? <G><Ellipse cx="107" cy="52" rx="22" ry="49" fill={fur} transform="rotate(-12 107 52)" /><Ellipse cx="174" cy="52" rx="22" ry="49" fill={fur} transform="rotate(12 174 52)" /><Ellipse cx="107" cy="49" rx="10" ry="32" fill="#E5B8AE" /><Ellipse cx="174" cy="49" rx="10" ry="32" fill="#E5B8AE" /></G> : <G><Ellipse cx="76" cy="104" rx="27" ry="51" fill="#99745A" transform="rotate(17 76 104)" /><Ellipse cx="204" cy="104" rx="27" ry="51" fill="#99745A" transform="rotate(-17 204 104)" /></G>}
    <Ellipse cx="140" cy="118" rx="75" ry="64" fill={fur} />
    {kind === 'cat' && <G stroke="#B18F68" strokeWidth="5" strokeLinecap="round"><Path d="M127 61L130 77M153 61L150 77M140 59V78" /></G>}
    <Ellipse cx="140" cy="141" rx="34" ry="25" fill="#FFF4E7" />
    <Ellipse cx="93" cy="137" rx="12" ry="7" fill="#E5B0A0" /><Ellipse cx="187" cy="137" rx="12" ry="7" fill="#E5B0A0" />
    {resting ? <G stroke={outline} strokeWidth="4" strokeLinecap="round" fill="none"><Path d="M103 115Q111 122 119 115M161 115Q169 122 177 115" /></G> : <G fill={outline}><Ellipse cx="111" cy="115" rx="4" ry="6" /><Ellipse cx="169" cy="115" rx="4" ry="6" /></G>}
    <Path d="M134 134Q140 129 146 134L140 140Z" fill="#A57973" />
    <Path d="M140 140V145M140 145Q130 156 124 146M140 145Q150 156 156 146" fill="none" stroke={outline} strokeWidth="2.5" strokeLinecap="round" />
    {kind === 'cat' && <G stroke={outline} strokeWidth="1.8" strokeLinecap="round"><Path d="M87 142L61 138M87 149L63 153M193 142L219 138M193 149L217 153" /></G>}
    {(grown || kind === 'bear') && <G><Path d="M108 173L140 182L172 173L164 194L140 184L116 194Z" fill={grown ? '#9E3B33' : '#7A6860'} /><Circle cx="140" cy="183" r="6" fill="#FAF2EA" /></G>}
    <G fill="#D4A373"><Path d="M38 178V164M31 171H45" stroke="#B56557" strokeWidth="2" /><Circle cx="232" cy="76" r="3" /><Rect x="38" y="76" width="8" height="8" rx="2" transform="rotate(45 42 80)" /></G>
  </Svg>;
}
