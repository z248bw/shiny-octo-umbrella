def date_to_naive_str(date):
    return date.replace(tzinfo=None).isoformat()


class TravelException(Exception):
    @staticmethod
    def raise_exception(message):
        e = TravelException()
        e.message = message
        raise e
