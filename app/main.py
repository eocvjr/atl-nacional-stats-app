from api import find_team_match_today, get_full_match_center, get_next_match

next_match = get_next_match()

print("\nPRÓXIMO PARTIDO")
print("=" * 80)

if next_match:
    print(f"{next_match['home_team']} vs {next_match['away_team']}")
    print(f"Posición: ({next_match['home_position']} - {next_match['away_position']})")
    print(f"Rival: {next_match['opponent']}")
    print(f"Condición: {next_match['venue_label']}")
    print(f"Torneo: {next_match['tournament_name']}")
    print(f"País: {next_match['country_name']}")
    print(f"Temporada: {next_match['season_name']}")
    print(f"Fecha: {next_match['date']}")
    print(f"Hora: {next_match['time']}")
else:
    print("No se encontró el próximo partido.")

matches = find_team_match_today()

if not matches:
    print("\nNo se encontró un partido de Atlético Nacional hoy.")
else:
    match = matches[0]

    data = get_full_match_center(
        match["event_id"],
        match["tournament_id"],
        match["season_id"]
    )

    info = data["match_info"]
    positions = data["team_positions"]
    flat_table = data["flat_table"]
    main_odds = data["main_odds_market"]
    stats_by_period = data["stats_by_period"]
    lineups = data["lineups"]

    print("\nINFORMACIÓN DEL PARTIDO")
    print("=" * 80)
    print(f"{info['home_team']} vs {info['away_team']}")
    print(f"Torneo: {info['tournament_name']}")
    print(f"País: {info['country_name']}")
    print(f"Temporada: {info['season_name']}")
    print(f"Marcador: {info['home_score']} - {info['away_score']}")
    print(f"Estado: {info['status']}")

    print("\nPOSICIONES EN LA TABLA")
    print("=" * 80)
    print(f"{info['home_team']}: posición {positions['home_position']} | puntos {positions['home_points']}")
    print(f"{info['away_team']}: posición {positions['away_position']} | puntos {positions['away_points']}")

    print("\nTABLA DE POSICIONES")
    print("=" * 80)
    print(f"{info['tournament_name']}")
    print("-" * 80)
    print(f"{'POS':<5}{'EQUIPO':<28}{'PJ':<5}{'G':<5}{'E':<5}{'P':<5}{'GF':<5}{'GC':<5}{'DG':<6}{'PTS':<5}")
    print("-" * 80)

    for row in flat_table:
        print(
            f"{str(row['position']):<5}"
            f"{str(row['team_name'])[:27]:<28}"
            f"{str(row['played']):<5}"
            f"{str(row['wins']):<5}"
            f"{str(row['draws']):<5}"
            f"{str(row['losses']):<5}"
            f"{str(row['goals_for']):<5}"
            f"{str(row['goals_against']):<5}"
            f"{str(row['goal_diff']):<6}"
            f"{str(row['points']):<5}"
        )

    print("\nALINEACIONES")
    print("=" * 80)
    print(f"Confirmadas: {lineups['confirmed']}")

    print(f"\nXI TITULAR - {info['home_team']}")
    print("-" * 80)
    for player in lineups["home_xi"]:
        if player["rating"] is not None:
            print(f"{player['position']:<6}{player['name']:<35}Rating: {player['rating']}")
        else:
            print(f"{player['position']:<6}{player['name']}")

    print(f"\nXI TITULAR - {info['away_team']}")
    print("-" * 80)
    for player in lineups["away_xi"]:
        if player["rating"] is not None:
            print(f"{player['position']:<6}{player['name']:<35}Rating: {player['rating']}")
        else:
            print(f"{player['position']:<6}{player['name']}")

    print("\nCUOTAS")
    print("=" * 80)
    if main_odds["choices"]:
        print(f"Mercado: {main_odds['market_name']}")
        for choice in main_odds["choices"]:
            print(f"{choice['name']}: {choice['odd']}")
    else:
        print("No hay cuotas disponibles.")

    print("\nESTADÍSTICAS DEL PARTIDO - TOTAL")
    print("=" * 80)
    if stats_by_period["TOTAL"]:
        for stat in stats_by_period["TOTAL"]:
            print(f"{stat['name']}")
            print(f"{stat['home']} - {stat['away']}")
            print()
    else:
        print("No hay estadísticas totales disponibles.")

    print("\nESTADÍSTICAS DEL PARTIDO - 1ER TIEMPO")
    print("=" * 80)
    if stats_by_period["1T"]:
        for stat in stats_by_period["1T"]:
            print(f"{stat['name']}")
            print(f"{stat['home']} - {stat['away']}")
            print()
    else:
        print("No hay estadísticas del 1er tiempo disponibles.")

    print("\nESTADÍSTICAS DEL PARTIDO - 2DO TIEMPO")
    print("=" * 80)
    if stats_by_period["2T"]:
        for stat in stats_by_period["2T"]:
            print(f"{stat['name']}")
            print(f"{stat['home']} - {stat['away']}")
            print()
    else:
        print("No hay estadísticas del 2do tiempo disponibles.")