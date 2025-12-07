export const responseHandler = (req, res, next) => {
    res.ok = (data = {}, message = 'Success operation') => {
        res.status(200).json({
            code: 200,
            success: true,
            message,
            data: data ?? {},
            error: {},
        });
    };

    res.created = (data = null, message = 'Resource created') => {
        res.status(201).json({
            code: 201,
            success: true,
            message,
            data,
            error: {}
        });
    };

    res.badRequest = (error = {}, message = 'Bad request') => {
        res.status(400).json({
            code: 400,
            success: false,
            message,
            data: {},
            error: error ?? {},
        });
    };

    res.unauthorized = (error = {}, message = 'Unauthorized') => {
        res.status(401).json({
            code: 401,
            success: false,
            message,
            data: {},
            error: error ?? {},
        });
    };

    res.forbidden = (error = {}, message = 'Access denied') => {
        res.status(403).json({
            code: 403,
            success: false,
            message,
            data: {},
            error: error ?? {},
        });
    };

    res.notFound = (error = {}, message = 'Not found') => {
        res.status(404).json({
            code: 404,
            success: false,
            message,
            data: {},
            error: error ?? {},
        });
    };

    res.serverError = (error = {}, message = 'Internal server error') => {
        res.status(500).json({
            code: 500,
            success: false,
            message,
            data: {},
            error: error ?? {},
        });
    };

    next();
};